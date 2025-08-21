export const formatterInputRequest = (
  listBusqueda: any[],
  busquedaKey: string,
) => {
  const higlightText = busquedaKey; // uso el texto pasado en busquedaKey

  // Expresión regular para buscar patrones de texto dentro de {{}}
  const regex = /{{(.*?)}}/g;

  return higlightText.replace(regex, (match, grupo) => {
    const existe = listBusqueda.some((item) => item.key === grupo);

    if (existe) {
      return `<span style="color: #00a6f4;">{{${grupo}}}</span>`;
    } else {
      return `<span style="color: #D2042D;">{{${grupo}}}</span>`;
    }
  });
};
