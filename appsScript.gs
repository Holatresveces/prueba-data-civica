function doGet() {
  // Abrir un spreadsheet por su id
  const spreadsheet = SpreadsheetApp.openById(
    "1vHlkyo9yzpo-2sgzQdZS0qv24lSUDJ2vuVw6tnQv1X8"
  );

  const response = {
    crimenes: [],
    entidades: [],
  };

  setCrimenes();
  setEntidades();

  function setCrimenes() {
    // Seleccionar la hoja que tiene los datos
    const sheet = spreadsheet.getSheets()[0];

    // Obtener los valores que tiene
    const values = sheet.getDataRange().getValues();

    // Quitar los headers
    values.shift();

    // Agregar datos
    for (let i = 0; i < values.length; i++) {
      let row = values[i];
      const [id_crime, crime_name] = row;

      let register = { id: id_crime, name: crime_name };

      response.crimenes.push(register);
    }
  }

  function setEntidades() {
    const sheet = spreadsheet.getSheets()[1];

    const values = sheet.getDataRange().getValues();

    // Quitar los headers
    values.shift();

    for (let i = 0; i < values.length; i++) {
      let row = values[i];

      const [id_ent, name_ent, id_mun, name_mun, name_ent_short] = row;

      const lastEntidad = response.entidades[response.entidades.length - 1];

      if (!lastEntidad || lastEntidad.id !== id_ent) {
        response.entidades.push({
          id: id_ent,
          name: name_ent,
          name_ent_short,
          municipios: [{ id: id_mun, name: name_mun }],
        });
      } else {
        lastEntidad.municipios.push({ id: id_mun, name: name_mun });
      }
    }
  }

  // Parsear JSON
  const json = JSON.stringify(response);

  return ContentService.createTextOutput(json).setMimeType(
    ContentService.MimeType.JSON
  );
}
