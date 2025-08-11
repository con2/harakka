type LangMap = {
  en: string;
  fi: string;
};
type StepMap = Record<string, LangMap>;

export const stepper: Record<string, StepMap> = {
  addItem: {
    1: {
      en: "Choose organization and location",
      fi: "Valitse organisaatio ja sijainti",
    },
    2: {
      en: "Create your items",
      fi: "Luo tuotteesi",
    },
    3: {
      en: "Item summary",
      fi: "Tuoteyhteenveto",
    },
  },
  general: {
    goToStep: {
      en: "Go to step",
      fi: "Siirry vaiheeseen",
    },
  },
};
