import { renderToStaticMarkup } from "react-dom/server";
import DiffView from "./DiffView";

describe("DiffView", () => {
  function renderHtml(unified = false) {
    return renderToStaticMarkup(
      <DiffView
        left={["\t  indented line"]}
        right={["\t  indented line"]}
        unified={unified}
      />
    );
  }

  it("preserves indentation-sensitive whitespace in side-by-side lines", () => {
    const html = renderHtml();

    expect(html).toContain("whitespace-pre");
    expect(html).toContain("[tab-size:2]");
    expect(html).toContain("\t  indented line");
  });

  it("preserves indentation-sensitive whitespace in unified lines", () => {
    const html = renderHtml(true);

    expect(html).toContain("whitespace-pre");
    expect(html).toContain("[tab-size:2]");
    expect(html).toContain("\t  indented line");
  });
});
