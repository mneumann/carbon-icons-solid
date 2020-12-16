import {
  formatAttributes,
  toString,
  defaultAttributes,
} from "@carbon/icon-helpers";
import { IconOutput } from "@carbon/icons";

function template(output: IconOutput) {
  const { moduleName, descriptor } = output;
  const {fill, width, height, ...attrs} = descriptor.attrs;

  return `
  import { CarbonIconComponent } from '../index';
  const ${moduleName} : CarbonIconComponent = (props) => (
    <svg
      data-carbon-icon="${moduleName}"
      fill={props.fill || "${fill}"}
      width={props.width || "${width}"}
      height={props.height || "${height}"}
      ${formatAttributes(attrs)}
      preserveAspectRatio="${defaultAttributes.preserveAspectRatio}"
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      aria-hidden={
        props["aria-label"] || props["aria-labelledby"] || props.title
      }
      role={
        props["aria-label"] || props["aria-labelledby"] || props.title
          ? "img"
          : undefined
      }
      focusable={props.tabindex === "0" ? true : props.focusable}
      tabindex={props.tabindex}
      id={props.id}
      class={props.class}
      className={props.className}
      title={props.title}
      style={props.style}
      stroke={props.stroke}
      onClick={props.onClick}
      onMouseOver={props.onMouseOver}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onKeyUp={props.onKeyUp}
      onKeyDown={props.onKeyDown}
    >
      ${descriptor.content.map((element) => toString(element)).join("")}
      {props.children || (props.title && <title>{props.title}</title>)}
    </svg>
  );
  export default ${moduleName};`;
}

function templateSvg(output: IconOutput) {
  const { moduleName, descriptor } = output;

  return `<svg data-svg-carbon-icon="${moduleName}"
  ${formatAttributes(descriptor.attrs)}
  preserveAspectRatio="${defaultAttributes.preserveAspectRatio}">
  ${descriptor.content.map((element) => toString(element)).join("")}
</svg>`;
}

export { template, templateSvg };
