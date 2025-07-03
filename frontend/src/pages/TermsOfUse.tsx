import { Separator } from "@/components/ui/separator";

const TermsOfUse = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl">Terms of Use / Käyttöehdot</h2>
        <div className="flex flex-col items-center">
          <p className="text-sm text-slate-500">
            Updated/Päivitetty 24.04.2025
          </p>
          <Separator className="my-4" />
        </div>
        <div className="mb-8">
          <p className="italic text-sm text-slate-500">in English</p>
          <h3 className="text-secondary">Terms of Use</h3>
          <p>
            <strong>Effective Date:</strong> [Insert date]
          </p>
          <p>
            <strong>Website:</strong> [Your Website URL]
          </p>

          <p>By using this website, you agree to the following terms.</p>

          <ul>
            <li>
              <strong>Service Description:</strong> We provide [brief
              description of your services].
            </li>
            <li>
              <strong>User Conduct:</strong> You agree not to use this website
              for illegal or harmful activities.
            </li>
            <li>
              <strong>Intellectual Property:</strong> All content is owned by us
              or our partners and may not be copied without permission.
            </li>
            <li>
              <strong>Limitation of Liability:</strong> We are not liable for
              any indirect or consequential damages arising from your use of the
              site.
            </li>
            <li>
              <strong>Termination:</strong> We may suspend or terminate access
              for users who violate these terms.
            </li>
            <li>
              <strong>Governing Law:</strong> These terms are governed by
              Finnish law. Disputes will be handled in Finnish courts.
            </li>
            <li>
              <strong>Changes:</strong> We may update these terms. Continued use
              of the site means you accept the changes.
            </li>
          </ul>
        </div>
        <div className="mb-8">
          <p className="italic text-sm text-slate-500">suomeksi</p>
          <h3 className="text-secondary">Käyttöehdot</h3>
          <p>
            <strong>Voimassa alkaen:</strong> [Päivämäärä]
          </p>
          <p>
            <strong>Verkkosivusto:</strong> [Sivustosi URL]
          </p>

          <p>Käyttämällä tätä verkkosivustoa hyväksyt seuraavat ehdot.</p>

          <ul>
            <li>
              <strong>Palvelun kuvaus:</strong> Tarjoamme [lyhyt kuvaus
              palveluistasi].
            </li>
            <li>
              <strong>Käyttäjän vastuut:</strong> Sitouduit olemaan käyttämättä
              sivustoa laittomaan tai vahingolliseen toimintaan.
            </li>
            <li>
              <strong>Immateriaalioikeudet:</strong> Kaikki sivuston sisältö on
              meidän tai yhteistyökumppaneidemme omaisuutta eikä sitä saa
              kopioida ilman lupaa.
            </li>
            <li>
              <strong>Vastuunrajoitus:</strong> Emme vastaa mistään välillisistä
              tai epäsuorista vahingoista, jotka aiheutuvat sivuston käytöstä.
            </li>
            <li>
              <strong>Käyttöoikeuden päättäminen:</strong> Voimme keskeyttää tai
              lopettaa käyttäjän pääsyn sivustolle ehtojen rikkomisen vuoksi.
            </li>
            <li>
              <strong>Sovellettava laki:</strong> Näihin ehtoihin sovelletaan
              Suomen lakia. Mahdolliset riidat käsitellään suomalaisissa
              tuomioistuimissa.
            </li>
            <li>
              <strong>Muutokset:</strong> Saatamme päivittää ehtoja. Sivuston
              käytön jatkaminen merkitsee hyväksymistä.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
