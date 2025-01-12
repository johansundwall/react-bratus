declare class ASTParser {
    private path;
    private componentMap;
    private static log;
    constructor(sourcePath: string, log: boolean);
    compile(): void;
    private writeDataToFile;
    getFilesAndDirectories(): Promise<string[]>;
    static peek<T>(array: T[]): T;
    private parseFile;
    static logEntryToFile(logEntry: string): void;
}
export default ASTParser;
