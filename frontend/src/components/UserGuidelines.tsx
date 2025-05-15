import { useAppSelector } from "@/store/hooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

export const UserGuide: React.FC = () => {
  const selectedUser = useAppSelector(selectSelectedUser);
  const isAdmin = ["admin", "superVera"].includes(selectedUser?.role ?? "");

  // Add language support
  const { lang } = useLanguage();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">
      {/* Guidelines */}
      <div className="flex flex-col items-start">
        <section className="w-full max-w-xl px-4 sm:px-6 md:px-8 mx-auto mb-10">
          <h2 className="text-2xl font-bold text-center mb-6">
            {t.userGuide.title.user[lang]}
          </h2>
          <Accordion type="single" collapsible className="w-full mb-10">
            <AccordionItem value="user-1">
              <AccordionTrigger>
                {t.userGuide.sections.getStarted.title[lang]}
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                  <li
                    dangerouslySetInnerHTML={{
                      __html: t.userGuide.sections.getStarted.content[lang][0],
                    }}
                  />
                  <li
                    dangerouslySetInnerHTML={{
                      __html: t.userGuide.sections.getStarted.content[lang][1],
                    }}
                  />
                  <li
                    dangerouslySetInnerHTML={{
                      __html: t.userGuide.sections.getStarted.content[lang][2],
                    }}
                  />
                  <li>
                    {t.userGuide.sections.getStarted.content[lang][3]}
                    <ul className="list-disc ml-6">
                      {t.userGuide.sections.getStarted.filters[lang].map(
                        (filter, index) => (
                          <li key={index}>{filter}</li>
                        ),
                      )}
                    </ul>
                  </li>
                  <li>
                    {t.userGuide.sections.getStarted.content[lang][4]}
                    <ul className="list-disc ml-6">
                      {t.userGuide.sections.getStarted.search[lang].map(
                        (searchBy, index) => (
                          <li key={index}>{searchBy}</li>
                        ),
                      )}
                    </ul>
                  </li>
                  <li
                    dangerouslySetInnerHTML={{
                      __html:
                        t.userGuide.sections.getStarted.dateSelection[lang],
                    }}
                  />
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="user-2">
              <AccordionTrigger>
                {t.userGuide.sections.howToOrder.title[lang]}
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                  {t.userGuide.sections.howToOrder.content[lang].map(
                    (step, index) => (
                      <li
                        key={index}
                        dangerouslySetInnerHTML={{ __html: step }}
                      />
                    ),
                  )}
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {isAdmin && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">
                {t.userGuide.title.admin[lang]}
              </h2>
              <Accordion type="single" collapsible className="w-full mb-10">
                <AccordionItem value="admin-1">
                  <AccordionTrigger>
                    {t.userGuide.sections.dashboard.title[lang]}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t.userGuide.sections.dashboard.content[lang],
                      }}
                    />
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      {t.userGuide.sections.dashboard.items[lang].map(
                        (item, index) => (
                          <li key={index}>{item}</li>
                        ),
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-2">
                  <AccordionTrigger>
                    {t.userGuide.sections.usersTeams.title[lang]}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t.userGuide.sections.usersTeams.users[lang],
                      }}
                    />
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t.userGuide.sections.usersTeams.teams[lang],
                      }}
                    />
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      {t.userGuide.sections.usersTeams.actions[lang].map(
                        (action, index) => (
                          <li key={index}>{action}</li>
                        ),
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-3">
                  <AccordionTrigger>
                    {t.userGuide.sections.itemManagement.title[lang]}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t.userGuide.sections.itemManagement.items[lang],
                      }}
                    />
                    <p>{t.userGuide.sections.itemManagement.details[lang]}</p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t.userGuide.sections.itemManagement.tags[lang],
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-4">
                  <AccordionTrigger>
                    {t.userGuide.sections.orders.title[lang]}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      {t.userGuide.sections.orders.actions[lang].map(
                        (action, index) => (
                          <li key={index}>{action}</li>
                        ),
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </section>
      </div>

      {/* FAQ Section */}
      <div className="flex flex-col items-start">
        <section className="w-full max-w-xl px-4 sm:px-6 md:px-8 mx-auto mb-10">
          <h2 className="text-2xl font-bold text-center mb-6">
            {t.userGuide.title.faq[lang]}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1" className="w-full">
              <AccordionTrigger className="w-full text-left">
                {t.userGuide.faq.q1.question[lang]}
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                {t.userGuide.faq.q1.answer[lang]}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="w-full">
              <AccordionTrigger className="w-full text-left">
                {t.userGuide.faq.q2.question[lang]}
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                {t.userGuide.faq.q2.answer[lang]}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="w-full">
              <AccordionTrigger className="w-full text-left">
                {t.userGuide.faq.q3.question[lang]}
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                {t.userGuide.faq.q3.answer[lang]}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="w-full">
              <AccordionTrigger className="w-full text-left">
                {t.userGuide.faq.q4.question[lang]}
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                {t.userGuide.faq.q4.answer[lang]}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
