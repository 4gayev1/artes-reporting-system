
export function SvgIcon({ id, size = 16, style }) {
  return (
    <svg width={size} height={size} style={style} aria-hidden="true">
      <use href={`../assets/icons.svg`} />
    </svg>
  );
}

export function BrowserIcon({ name, size = 16 }) {
    console.log(name)
  const n = (name || "").toLowerCase();
  const id = n.includes("chrome")  ? "icon-chrome"
           : n.includes("firefox") ? "icon-firefox"
           : n.includes("webkit")  ? "icon-webkit"
           : "icon-browser-generic";
  return <SvgIcon id={id} size={size} />;
}

export function OSIcon({ name, size = 14 }) {
  const n = (name || "").toLowerCase();
  const id = (n.includes("windows") || n === "windows_nt") ? "icon-os-windows"
           : (n.includes("darwin") || n.includes("mac"))   ? "icon-os-mac"
           : (n.includes("linux") || n.includes("ubuntu") || n.includes("redhat") || n.includes("centos") || n.includes("debian")) ? "icon-os-linux"
           : "icon-os-generic";
  return <SvgIcon id={id} size={size} />;
}

export function ExecutorIcon({ name, size = 13 }) {
  const n = (name || "").toLowerCase();
  const id = n.includes("github")               ? "icon-exec-github"
           : n.includes("gitlab")               ? "icon-exec-gitlab"
           : n.includes("jenkins")              ? "icon-exec-jenkins"
           : (n.includes("local") || n.includes("manual")) ? "icon-exec-local"
           : "icon-exec-generic";
  return <SvgIcon id={id} size={size} />;
}