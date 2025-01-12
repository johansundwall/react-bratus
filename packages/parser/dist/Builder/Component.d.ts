import Import from './Import';
import JSXElement from './JSXElement';
import ParsableElement from './ParsableElement';
declare class Component extends ParsableElement {
    private JSXElements;
    private imports;
    timesUsed: number;
    constructor(path: string);
    getLinesOfCode(): number;
    addJSXElement(element: JSXElement): void;
    addImport(_import: Import): void;
    hasJSX(): boolean;
    getJSXElements(): JSXElement[];
}
export default Component;
