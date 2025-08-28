type LangMap = {
  en: string;
  fi: string;
};
type StepMap = Record<string, LangMap>;

export const stepper: Record<string, StepMap> = {
  addItem: {
    1: {
      en: "Choose location",
      fi: "Valitse sijainti",
    },
    2: {
      en: "Create your items",
      fi: "Luo tuotteesi",
    },
    3: {
      en: "Review and Upload",
      fi: "Tarkista ja lataa",
    },
  },
  general: {
    goToStep: {
      en: "Go to step",
      fi: "Siirry vaiheeseen",
    },
  },
};
