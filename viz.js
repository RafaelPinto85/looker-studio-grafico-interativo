const dscc = window.dscc;

const COR_CONFORME = "#4d5b32";
const COR_INCONFORME = "#df7c0b";

function desenharGrafico(data) {
  const container = document.getElementById("grafico");

  if (!container) return;

  container.innerHTML = "";

  const dimensoes = data.fields?.dimensions || [];
  const metricas = data.fields?.metrics || [];

  const linhas = data.tables?.DEFAULT || [];

  if (!linhas.length) {
    container.textContent = "Nenhum dado disponível.";
    return;
  }

  const largura = Math.max(container.clientWidth || 600, 300);
  const margemEsquerda = 12;
  const margemDireita = 12;
  const alturaLinha = 44;
  const altura = linhas.length * alturaLinha + 20;

  const valores = linhas.map((linha) => ({
    linha,
    resumo: String(linha[0] ?? ""),
    conforme: Number(linha[1]) || 0,
    inconforme: Number(linha[2]) || 0
  }));

  const maiorTotal = Math.max(
    1,
    ...valores.map((item) => item.conforme + item.inconforme)
  );

  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", String(altura));
  svg.setAttribute("viewBox", `0 0 ${largura} ${altura}`);

  valores.forEach((item, indice) => {
    const y = indice * alturaLinha + 8;
    const area = largura - margemEsquerda - margemDireita;

    const larguraConforme = area * item.conforme / maiorTotal;
    const larguraInconforme = area * item.inconforme / maiorTotal;

    const grupo = document.createElementNS(svgNS, "g");
    grupo.style.cursor = "pointer";

    const retanguloConforme = document.createElementNS(svgNS, "rect");
    retanguloConforme.setAttribute("x", margemEsquerda);
    retanguloConforme.setAttribute("y", y);
    retanguloConforme.setAttribute("width", Math.max(0, larguraConforme));
    retanguloConforme.setAttribute("height", 25);
    retanguloConforme.setAttribute("fill", COR_CONFORME);

    const retanguloInconforme = document.createElementNS(svgNS, "rect");
    retanguloInconforme.setAttribute(
      "x",
      margemEsquerda + larguraConforme
    );
    retanguloInconforme.setAttribute("y", y);
    retanguloInconforme.setAttribute(
      "width",
      Math.max(0, larguraInconforme)
    );
    retanguloInconforme.setAttribute("height", 25);
    retanguloInconforme.setAttribute("fill", COR_INCONFORME);

    grupo.appendChild(retanguloConforme);
    grupo.appendChild(retanguloInconforme);

    const texto = document.createElementNS(svgNS, "text");
    texto.setAttribute("x", margemEsquerda);
    texto.setAttribute("y", y + 39);
    texto.setAttribute("font-size", "11");
    texto.setAttribute("fill", "#333");
    texto.textContent = item.resumo;

    grupo.appendChild(texto);

    const titulo = document.createElementNS(svgNS, "title");
    titulo.textContent =
      `${item.resumo}\n` +
      `Conforme: ${item.conforme}\n` +
      `Não Conformidade: ${item.inconforme}`;

    grupo.appendChild(titulo);

    grupo.addEventListener("click", () => {
      const dimension = dimensoes[0];

      if (!dimension?.id) return;

      dscc.sendInteraction(
        "filtro_avaliacao",
        dscc.InteractionType.FILTER,
        {
          concepts: [dimension.id],
          values: [[item.resumo]]
        }
      );
    });

    svg.appendChild(grupo);
  });

  container.appendChild(svg);
}

dscc.subscribeToData(
  desenharGrafico,
  { transform: dscc.objectTransform }
);

