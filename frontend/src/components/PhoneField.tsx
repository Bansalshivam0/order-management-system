import { useState, useRef, useEffect } from 'react'

type Country = [string, string, string] // [name, iso2, dialCode]

const COUNTRIES: Country[] = [
  ['Afghanistan', 'af', '93'],
  ['Albania', 'al', '355'],
  ['Algeria', 'dz', '213'],
  ['Andorra', 'ad', '376'],
  ['Angola', 'ao', '244'],
  ['Antigua and Barbuda', 'ag', '1268'],
  ['Argentina', 'ar', '54'],
  ['Armenia', 'am', '374'],
  ['Australia', 'au', '61'],
  ['Austria', 'at', '43'],
  ['Azerbaijan', 'az', '994'],
  ['Bahamas', 'bs', '1242'],
  ['Bahrain', 'bh', '973'],
  ['Bangladesh', 'bd', '880'],
  ['Barbados', 'bb', '1246'],
  ['Belarus', 'by', '375'],
  ['Belgium', 'be', '32'],
  ['Belize', 'bz', '501'],
  ['Benin', 'bj', '229'],
  ['Bhutan', 'bt', '975'],
  ['Bolivia', 'bo', '591'],
  ['Bosnia and Herzegovina', 'ba', '387'],
  ['Botswana', 'bw', '267'],
  ['Brazil', 'br', '55'],
  ['Brunei', 'bn', '673'],
  ['Bulgaria', 'bg', '359'],
  ['Burkina Faso', 'bf', '226'],
  ['Burundi', 'bi', '257'],
  ['Cambodia', 'kh', '855'],
  ['Cameroon', 'cm', '237'],
  ['Canada', 'ca', '1'],
  ['Cape Verde', 'cv', '238'],
  ['Central African Republic', 'cf', '236'],
  ['Chad', 'td', '235'],
  ['Chile', 'cl', '56'],
  ['China', 'cn', '86'],
  ['Colombia', 'co', '57'],
  ['Comoros', 'km', '269'],
  ['Congo', 'cg', '242'],
  ['Congo (DRC)', 'cd', '243'],
  ['Costa Rica', 'cr', '506'],
  ['Croatia', 'hr', '385'],
  ['Cuba', 'cu', '53'],
  ['Cyprus', 'cy', '357'],
  ['Czech Republic', 'cz', '420'],
  ['Denmark', 'dk', '45'],
  ['Djibouti', 'dj', '253'],
  ['Dominican Republic', 'do', '1809'],
  ['Ecuador', 'ec', '593'],
  ['Egypt', 'eg', '20'],
  ['El Salvador', 'sv', '503'],
  ['Equatorial Guinea', 'gq', '240'],
  ['Eritrea', 'er', '291'],
  ['Estonia', 'ee', '372'],
  ['Eswatini', 'sz', '268'],
  ['Ethiopia', 'et', '251'],
  ['Fiji', 'fj', '679'],
  ['Finland', 'fi', '358'],
  ['France', 'fr', '33'],
  ['Gabon', 'ga', '241'],
  ['Gambia', 'gm', '220'],
  ['Georgia', 'ge', '995'],
  ['Germany', 'de', '49'],
  ['Ghana', 'gh', '233'],
  ['Greece', 'gr', '30'],
  ['Grenada', 'gd', '1473'],
  ['Guatemala', 'gt', '502'],
  ['Guinea', 'gn', '224'],
  ['Guinea-Bissau', 'gw', '245'],
  ['Guyana', 'gy', '592'],
  ['Haiti', 'ht', '509'],
  ['Honduras', 'hn', '504'],
  ['Hong Kong', 'hk', '852'],
  ['Hungary', 'hu', '36'],
  ['Iceland', 'is', '354'],
  ['India', 'in', '91'],
  ['Indonesia', 'id', '62'],
  ['Iran', 'ir', '98'],
  ['Iraq', 'iq', '964'],
  ['Ireland', 'ie', '353'],
  ['Israel', 'il', '972'],
  ['Italy', 'it', '39'],
  ['Jamaica', 'jm', '1876'],
  ['Japan', 'jp', '81'],
  ['Jordan', 'jo', '962'],
  ['Kazakhstan', 'kz', '7'],
  ['Kenya', 'ke', '254'],
  ['Kiribati', 'ki', '686'],
  ['Kuwait', 'kw', '965'],
  ['Kyrgyzstan', 'kg', '996'],
  ['Laos', 'la', '856'],
  ['Latvia', 'lv', '371'],
  ['Lebanon', 'lb', '961'],
  ['Lesotho', 'ls', '266'],
  ['Liberia', 'lr', '231'],
  ['Libya', 'ly', '218'],
  ['Liechtenstein', 'li', '423'],
  ['Lithuania', 'lt', '370'],
  ['Luxembourg', 'lu', '352'],
  ['Macau', 'mo', '853'],
  ['Madagascar', 'mg', '261'],
  ['Malawi', 'mw', '265'],
  ['Malaysia', 'my', '60'],
  ['Maldives', 'mv', '960'],
  ['Mali', 'ml', '223'],
  ['Malta', 'mt', '356'],
  ['Marshall Islands', 'mh', '692'],
  ['Mauritania', 'mr', '222'],
  ['Mauritius', 'mu', '230'],
  ['Mexico', 'mx', '52'],
  ['Micronesia', 'fm', '691'],
  ['Moldova', 'md', '373'],
  ['Monaco', 'mc', '377'],
  ['Mongolia', 'mn', '976'],
  ['Montenegro', 'me', '382'],
  ['Morocco', 'ma', '212'],
  ['Mozambique', 'mz', '258'],
  ['Myanmar', 'mm', '95'],
  ['Namibia', 'na', '264'],
  ['Nauru', 'nr', '674'],
  ['Nepal', 'np', '977'],
  ['Netherlands', 'nl', '31'],
  ['New Zealand', 'nz', '64'],
  ['Nicaragua', 'ni', '505'],
  ['Niger', 'ne', '227'],
  ['Nigeria', 'ng', '234'],
  ['North Korea', 'kp', '850'],
  ['North Macedonia', 'mk', '389'],
  ['Norway', 'no', '47'],
  ['Oman', 'om', '968'],
  ['Pakistan', 'pk', '92'],
  ['Palau', 'pw', '680'],
  ['Palestine', 'ps', '970'],
  ['Panama', 'pa', '507'],
  ['Papua New Guinea', 'pg', '675'],
  ['Paraguay', 'py', '595'],
  ['Peru', 'pe', '51'],
  ['Philippines', 'ph', '63'],
  ['Poland', 'pl', '48'],
  ['Portugal', 'pt', '351'],
  ['Qatar', 'qa', '974'],
  ['Romania', 'ro', '40'],
  ['Russia', 'ru', '7'],
  ['Rwanda', 'rw', '250'],
  ['Saint Kitts and Nevis', 'kn', '1869'],
  ['Saint Lucia', 'lc', '1758'],
  ['Saint Vincent', 'vc', '1784'],
  ['Samoa', 'ws', '685'],
  ['San Marino', 'sm', '378'],
  ['Saudi Arabia', 'sa', '966'],
  ['Senegal', 'sn', '221'],
  ['Serbia', 'rs', '381'],
  ['Seychelles', 'sc', '248'],
  ['Sierra Leone', 'sl', '232'],
  ['Singapore', 'sg', '65'],
  ['Slovakia', 'sk', '421'],
  ['Slovenia', 'si', '386'],
  ['Solomon Islands', 'sb', '677'],
  ['Somalia', 'so', '252'],
  ['South Africa', 'za', '27'],
  ['South Korea', 'kr', '82'],
  ['South Sudan', 'ss', '211'],
  ['Spain', 'es', '34'],
  ['Sri Lanka', 'lk', '94'],
  ['Sudan', 'sd', '249'],
  ['Suriname', 'sr', '597'],
  ['Sweden', 'se', '46'],
  ['Switzerland', 'ch', '41'],
  ['Syria', 'sy', '963'],
  ['Taiwan', 'tw', '886'],
  ['Tajikistan', 'tj', '992'],
  ['Tanzania', 'tz', '255'],
  ['Thailand', 'th', '66'],
  ['Timor-Leste', 'tl', '670'],
  ['Togo', 'tg', '228'],
  ['Tonga', 'to', '676'],
  ['Trinidad and Tobago', 'tt', '1868'],
  ['Tunisia', 'tn', '216'],
  ['Turkey', 'tr', '90'],
  ['Turkmenistan', 'tm', '993'],
  ['Tuvalu', 'tv', '688'],
  ['Uganda', 'ug', '256'],
  ['Ukraine', 'ua', '380'],
  ['United Arab Emirates', 'ae', '971'],
  ['United Kingdom', 'gb', '44'],
  ['United States', 'us', '1'],
  ['Uruguay', 'uy', '598'],
  ['Uzbekistan', 'uz', '998'],
  ['Vanuatu', 'vu', '678'],
  ['Venezuela', 've', '58'],
  ['Vietnam', 'vn', '84'],
  ['Yemen', 'ye', '967'],
  ['Zambia', 'zm', '260'],
  ['Zimbabwe', 'zw', '263'],
]

function flagEmoji(iso2: string) {
  return [...iso2.toUpperCase()].map(c =>
    String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))
  ).join('')
}

function guessCountry(val: string): Country {
  if (!val || !val.startsWith('+')) {
    return COUNTRIES.find(c => c[1] === 'in') ?? COUNTRIES[0]
  }
  const digits = val.slice(1)
  const sorted = [...COUNTRIES].sort((a, b) => b[2].length - a[2].length)
  return sorted.find(c => digits.startsWith(c[2])) ?? COUNTRIES.find(c => c[1] === 'in') ?? COUNTRIES[0]
}

interface PhoneFieldProps {
  value: string
  onChange: (val: string) => void
  id?: string
  name?: string
  required?: boolean
}

export default function PhoneField({ value, onChange, id, name, required }: PhoneFieldProps) {
  const [country, setCountry] = useState<Country>(() => guessCountry(value))
  const [local, setLocal] = useState<string>(() => {
    const c = guessCountry(value)
    const prefix = '+' + c[2]
    return value.startsWith(prefix) ? value.slice(prefix.length) : ''
  })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 10)
    }
  }, [open])

  const filtered = search.trim()
    ? COUNTRIES.filter(c =>
        c[0].toLowerCase().includes(search.toLowerCase()) ||
        c[2].startsWith(search.replace(/\D/g, ''))
      )
    : COUNTRIES

  function selectCountry(c: Country) {
    setCountry(c)
    setOpen(false)
    setSearch('')
    onChange('+' + c[2] + local)
  }

  function handleLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/[^\d\s\-()+]/g, '')
    setLocal(v)
    onChange('+' + country[2] + v)
  }

  return (
    <div className="phone-field" ref={wrapRef}>
      <button
        type="button"
        className={`phone-field-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Select country code"
      >
        <span className="phone-field-flag">{flagEmoji(country[1])}</span>
        <span className="phone-field-code">+{country[2]}</span>
        <svg className="phone-field-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <span className="phone-field-divider" />

      <input
        id={id}
        name={name}
        type="tel"
        className="phone-field-input"
        required={required}
        placeholder="Phone number"
        value={local}
        onChange={handleLocal}
      />

      {open && (
        <div className="phone-field-dropdown">
          <div className="phone-field-search">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul>
            {filtered.length === 0 ? (
              <li className="phone-field-empty">No results</li>
            ) : filtered.map(c => (
              <li
                key={c[1] + c[2]}
                className={`phone-field-option${c[1] === country[1] ? ' active' : ''}`}
                onMouseDown={e => { e.preventDefault(); selectCountry(c) }}
              >
                <span className="phone-field-flag">{flagEmoji(c[1])}</span>
                <span className="phone-field-oname">{c[0]}</span>
                <span className="phone-field-odial">+{c[2]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
