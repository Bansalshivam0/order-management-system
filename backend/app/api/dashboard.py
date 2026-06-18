from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Customer, Order, Product

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

DbDep = Annotated[Session, Depends(get_db)]

LOW_STOCK_THRESHOLD = 5


@router.get("")
def get_dashboard_stats(db: DbDep) -> dict:
    now = datetime.now(timezone.utc)

    # ── Summary counts ──────────────────────────────────────────────
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    low_stock = (
        db.query(func.count(Product.id))
        .filter(Product.quantity <= LOW_STOCK_THRESHOLD)
        .scalar()
        or 0
    )
    total_revenue = float(
        db.query(func.coalesce(func.sum(Order.total_amount_paid), 0)).scalar() or 0
    )

    # ── Revenue & orders for last 7 days ────────────────────────────
    seven_days_ago = now - timedelta(days=6)
    daily_rows = (
        db.query(
            func.date_trunc("day", Order.created_at).label("day"),
            func.count(Order.id).label("orders"),
            func.coalesce(func.sum(Order.total_amount_paid), 0).label("revenue"),
        )
        .filter(Order.created_at >= seven_days_ago)
        .group_by("day")
        .order_by("day")
        .all()
    )

    # Build a full 7-day series (fill zeros for missing days)
    day_map: dict[str, dict] = {}
    for row in daily_rows:
        key = row.day.strftime("%b %d")
        day_map[key] = {"orders": row.orders, "revenue": float(row.revenue)}

    revenue_trend = []
    for i in range(6, -1, -1):
        d = now - timedelta(days=i)
        key = d.strftime("%b %d")
        revenue_trend.append(
            {
                "date": key,
                "orders": day_map.get(key, {}).get("orders", 0),
                "revenue": day_map.get(key, {}).get("revenue", 0.0),
            }
        )

    # ── Top 5 products by revenue ────────────────────────────────────
    top_products_rows = (
        db.query(
            Product.product_name,
            func.count(Order.id).label("order_count"),
            func.coalesce(func.sum(Order.total_amount_paid), 0).label("revenue"),
        )
        .join(Order, Order.product_id == Product.id, isouter=True)
        .group_by(Product.id, Product.product_name)
        .order_by(func.coalesce(func.sum(Order.total_amount_paid), 0).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {
            "name": row.product_name,
            "orders": row.order_count,
            "revenue": float(row.revenue),
        }
        for row in top_products_rows
    ]

    # ── Low-stock products (full list) ──────────────────────────────
    low_stock_rows = (
        db.query(Product)
        .filter(Product.quantity <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity.asc())
        .all()
    )
    low_stock_list = [
        {
            "id": str(p.id),
            "name": p.product_name,
            "sku": p.sku_code,
            "price": float(p.price),
            "quantity": p.quantity,
        }
        for p in low_stock_rows
    ]

    # ── Recent 5 orders ─────────────────────────────────────────────
    recent_rows = (
        db.query(Order, Customer.name, Product.product_name)
        .join(Customer, Order.customer_id == Customer.id)
        .join(Product, Order.product_id == Product.id)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )
    recent_orders = [
        {
            "id": str(order.id)[:8],
            "customer": cname,
            "product": pname,
            "qty": order.quantity_ordered,
            "amount": float(order.total_amount_paid),
            "date": order.created_at.strftime("%b %d, %Y"),
        }
        for order, cname, pname in recent_rows
    ]

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock,
        "total_revenue": total_revenue,
        "revenue_trend": revenue_trend,
        "top_products": top_products,
        "recent_orders": recent_orders,
        "low_stock_list": low_stock_list,
    }
