export const passwordReset = {
  title: {
    fi: "Nollaa salasana",
    en: "Reset Password",
  },
  updating: {
    fi: "Päivitetään salasanaasi...",
    en: "Updating your password...",
  },
  // Auth UI translations for update_password view
  auth_ui: {
    password_label: {
      fi: "Uusi salasana",
      en: "New Password",
    },
    password_input_placeholder: {
      fi: "Syötä uusi salasanasi",
      en: "Enter your new password",
    },
    button_label: {
      fi: "Päivitä salasana",
      en: "Update Password",
    },
  },
  messages: {
    reset: {
      success: {
        en: "Your password was reset!",
        fi: "Salasanasi on vaihdettu!",
      },
    },
  },
  errors: {
    noPassword: {
      en: "Password cannot be empty",
      fi: "Salasana ei voi olla tyhjä",
    },
    invalidSession: {
      en: "There was an error with your session. <a href='/login'>Please request a new password reset link.",
      fi: "Istunnossasi tapahtui virhe. Pyydä uusi salasanan nollauslinkki.",
    },
    unknownError: {
      en: "An unexpected error occurred",
      fi: "Odottamaton virhe tapahtui",
    },
  },
};
