import { renderToStaticMarkup } from "react-dom/server";
import DiffView from "./DiffView";

describe("DiffView", () => {
  it("preserves indentation-sensitive whitespace in rendered lines", () => {
    const html = renderToStaticMarkup(
      <DiffView left={["\t  indented line"]} right={["\t  indented line"]} />
    );

    expect(html).toContain("whitespace-pre");
    expect(html).toContain("[tab-size:2]");
  });
});
