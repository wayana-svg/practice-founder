const fs = require("fs");

const path = "app/tasks-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

const styleNames = [
  "linkedItemButtonStyle",
  "linkedEditableRowStyle",
  "linkEditorBoxStyle",
  "linkedPopupBackdropStyle",
  "linkedPopupModalStyle",
  "linkedPopupContentStyle",
  "linkedPopupManagerLinkStyle",
];

/*
  Remove every duplicate copy of these style constants.
*/
for (const name of styleNames) {
  const regex = new RegExp(
    "const " + name + ": CSSProperties = \\{[\\s\\S]*?\\n\\};\\n?",
    "g"
  );

  text = text.replace(regex, "");
}

const cleanStyles = `
const linkedItemButtonStyle: CSSProperties = {
  ...linkedItemStyle,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};

const linkedEditableRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  borderBottom: \`1px solid \${colors.border}\`,
  padding: "8px 0",
};

const linkEditorBoxStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  marginTop: "14px",
  padding: "12px",
  background: colors.white,
  border: \`1px solid \${colors.border}\`,
};

const linkedPopupBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 300,
  background: "rgba(28,35,51,0.66)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px",
};

const linkedPopupModalStyle: CSSProperties = {
  width: "min(760px, 96vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: colors.cream,
  border: \`1px solid \${colors.border}\`,
  boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
  padding: "24px",
};

const linkedPopupContentStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const linkedPopupManagerLinkStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
  textAlign: "center",
};
`;

/*
  Add one clean copy before infoBoxStyle.
*/
text = text.replace(
  /const infoBoxStyle: CSSProperties = {/,
  cleanStyles + "\nconst infoBoxStyle: CSSProperties = {"
);

fs.writeFileSync(path, text);

console.log("Duplicate task linked-record styles cleaned.");