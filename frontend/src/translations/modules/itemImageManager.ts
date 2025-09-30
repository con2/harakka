export const itemImageManager = {
  title: {
    uploadNew: {
      fi: "Lataa uusi kuva",
      en: "Upload New Image",
    },
    gallery: {
      fi: "Tuotteen kuvat ({count})",
      en: "Item Images ({count})",
    },
    sections: {
      main: {
        fi: "Pääkuvat ({count})",
        en: "Main Images ({count})",
      },
      detail: {
        fi: "Yksityiskohtakuvat ({count})",
        en: "Detail Images ({count})",
      },
    },
  },
  dropzone: {
    instructions: {
      fi: "Vedä ja pudota kuva tähän tai klikkaa selataksesi",
      en: "Drag and drop an image here or click to browse",
    },
    fileInfo: {
      fi: "JPG, PNG, WebP, GIF max 5MB",
      en: "JPG, PNG, WebP, GIF up to 5MB",
    },
  },
  labels: {
    imageType: {
      fi: "Kuvan tyyppi",
      en: "Image Type",
    },
    altText: {
      fi: "Vaihtoehtoinen teksti (Saavutettavuus)",
      en: "Alt Text (Accessibility)",
    },
  },
  placeholders: {
    altText: {
      fi: "Kuvaile kuva saavutettavuutta varten",
      en: "Describe the image for accessibility",
    },
  },
  options: {
    select: {
      fi: "Valitse tyyppi",
      en: "Select type",
    },
    main: {
      fi: "Pääkuva",
      en: "Main",
    },
    detail: {
      fi: "Yksityiskohta",
      en: "Detail",
    },
  },
  buttons: {
    upload: {
      fi: "Lataa kuva",
      en: "Upload Image",
    },
    uploading: {
      fi: "Ladataan...",
      en: "Uploading...",
    },
    deleteImage: {
      fi: "Poista",
      en: "Delete",
    },
    cancel: {
      fi: "Peruuta",
      en: "Cancel",
    },
  },
  messages: {
    uploadComplete: {
      fi: "Valmis!",
      en: "Complete!",
    },
    noImages: {
      fi: "Ei ladattuja kuvia",
      en: "No images uploaded yet",
    },
    noDescription: {
      fi: "Ei kuvausta",
      en: "No description",
    },
    validation: {
      fileType: {
        fi: "Virheellinen tiedostotyyppi. Vain JPG, PNG, WebP ja GIF ovat sallittuja.",
        en: "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.",
      },
      fileSize: {
        fi: "Tiedosto on liian suuri. Maksimikoko on {size}MB.",
        en: "File is too large. Maximum size is {size}MB.",
      },
      noFile: {
        fi: "Valitse tiedosto ladattavaksi",
        en: "Please select a file to upload",
      },
    },
    toast: {
      upload: {
        loading: {
          fi: "Ladataan kuvaa...",
          en: "Uploading image...",
        },
        success: {
          fi: "Kuva ladattu onnistuneesti!",
          en: "Image uploaded successfully!",
        },
        error: {
          fi: "Kuvan lataaminen epäonnistui",
          en: "Failed to upload image",
        },
      },
      delete: {
        loading: {
          fi: "Poistetaan kuvaa...",
          en: "Deleting image...",
        },
        success: {
          fi: "Kuva poistettu onnistuneesti!",
          en: "Image deleted successfully!",
        },
        error: {
          fi: "Kuvan poistaminen epäonnistui",
          en: "Failed to delete image",
        },
      },
      loadError: {
        fi: "Kuvien lataaminen epäonnistui. Voit silti ladata uusia.",
        en: "Failed to load images. You can still upload new ones.",
      },
    },
    deleteConfirm: {
      title: {
        fi: "Oletko varma?",
        en: "Are you sure?",
      },
      description: {
        fi: "Tätä toimintoa ei voi kumota. Kuva poistetaan pysyvästi palvelimelta.",
        en: "This action cannot be undone. This will permanently delete the image from the server.",
      },
    },
  },
};
