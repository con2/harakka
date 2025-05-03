import { Separator } from "@/components/ui/separator"

const PrivacyPolicy = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
      <div className='max-w-4xl w-full bg-white shadow-md rounded-lg p-8'>
        <div className='mb-8'>
          <h2 className='text-2xl'>Privacy Policy / Tietosuojaseloste</h2>
          <div className='flex flex-col items-center'>
            <p className='text-sm text-slate-500'>Updated/Päivitetty 24.04.2025</p>
            <Separator className='my-4' />
          </div>
          <p className='italic text-sm text-slate-500'>in English</p>
          <h3 className='text-secondary'>Privacy Policy</h3>
          <p><strong>Effective Date:</strong> [Insert date]</p>
          <p><strong>Controller:</strong> Illusia Ry</p>
          <p><strong>Email:</strong> [Your Contact Email]</p>

          <p>We respect your privacy and process your personal data in accordance with the EU General Data Protection Regulation (GDPR) and Finnish law.</p>

          <ul>
            <li><strong>What data we collect:</strong> We may collect your name, email address, IP address, and browsing data when you use our website.</li>
            <li><strong>Purpose of processing:</strong> We process data to provide our services, communicate with you, and improve website performance.</li>
            <li><strong>Legal basis:</strong> We process personal data based on your consent, contract, or legitimate interest.</li>
            <li><strong>Data retention:</strong> We retain your data only as long as necessary for the purposes mentioned.</li>
            <li><strong>Your rights:</strong> You have the right to access, correct, delete, restrict or object to the processing of your data, and to lodge a complaint with the Finnish Data Protection Ombudsman.</li>
            <li><strong>Data sharing:</strong> We may share data with service providers (e.g., hosting, analytics) but never sell your information.</li>
            <li><strong>Cookies:</strong> We use cookies to improve your experience. You can control cookies through your browser settings.</li>
          </ul>
        </div>
        <div className='mb-8'>
          <p className='italic text-sm text-slate-500'>suomeksi</p>
          <h3 className='text-secondary'>Tietosuojaseloste</h3>
          <p><strong>Voimassa alkaen:</strong> [Päivämäärä]</p>
          <p><strong>Rekisterinpitäjä:</strong> Illusia Ry</p>
          <p><strong>Sähköposti:</strong> [Yhteystieto]</p>

          <p>Kunnioitamme yksityisyyttäsi ja käsittelemme henkilötietojasi EU:n yleisen tietosuoja-asetuksen (GDPR) ja Suomen lain mukaisesti.</p>

          <ol>
            <li><strong>Kerättävät tiedot:</strong> Saatamme kerätä nimesi, sähköpostiosoitteesi, IP-osoitteesi ja selaustietojasi käyttäessäsi verkkosivustoamme.</li>
            <li><strong>Tietojen käsittelyn tarkoitus:</strong> Tietoja käsitellään palvelujen tarjoamiseen, viestintään ja sivuston kehittämiseen.</li>
            <li><strong>Käsittelyn oikeusperuste:</strong> Tietoja käsitellään suostumuksesi, sopimuksen tai oikeutetun edun perusteella.</li>
            <li><strong>Säilytysaika:</strong> Säilytämme tietoja vain niin kauan kuin on tarpeen edellä mainittuihin tarkoituksiin.</li>
            <li><strong>Oikeutesi:</strong> Sinulla on oikeus tarkastaa, oikaista, poistaa tai rajoittaa tietojesi käsittelyä sekä tehdä valitus tietosuojavaltuutetulle.</li>
            <li><strong>Tietojen luovutus:</strong> Saatamme jakaa tietoja palveluntarjoajille (esim. hosting, analytiikka), mutta emme koskaan myy tietojasi.</li>
            <li><strong>Evästeet:</strong> Käytämme evästeitä parantaaksemme käyttökokemusta. Voit hallita niitä selaimesi asetuksista.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy