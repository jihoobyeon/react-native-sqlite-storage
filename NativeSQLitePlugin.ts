import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type Location = "default" | "Library" | "Documents" | "Shared";
interface DatabaseOptionalParams {
    createFromLocation?: number | string | undefined;
    // Database encryption pass phrase
    key?: string | undefined;
    readOnly?: boolean | undefined;
}

type DatabaseParams = DatabaseParamsIOS | DatabaseParamsAndroid;

interface DatabaseParamsIOS extends DatabaseOptionalParams {
    name: string;
    /**
     * Affects iOS database file location
     * 'default': Library/LocalDatabase subdirectory - NOT visible to iTunes and NOT backed up by iCloud
     * 'Library': Library subdirectory - backed up by iCloud, NOT visible to iTunes
     * 'Documents': Documents subdirectory - visible to iTunes and backed up by iCloud
     */
    location: Location;
}

interface DatabaseParamsAndroid extends DatabaseOptionalParams {
    name: string;
}

interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: ResultSetRowList;
}

interface ResultSetRowList {
    length: number;
    raw(): any[];
    item(index: number): any;
}

enum SQLErrors {
    UNKNOWN_ERR = 0,
    DATABASE_ERR = 1,
    VERSION_ERR = 2,
    TOO_LARGE_ERR = 3,
    QUOTA_ERR = 4,
    SYNTAX_ERR = 5,
    CONSTRAINT_ERR = 6,
    TIMEOUT_ERR = 7,
}

interface SQLError {
    code: number;
    message: string;
}

type StatementCallback = (transaction: Transaction, resultSet: ResultSet) => void;
type StatementErrorCallback = (transaction: Transaction, error: SQLError) => void;
interface Transaction {
    executeSql(sqlStatement: string, arguments?: any[]): Promise<[Transaction, ResultSet]>;
    executeSql(
        sqlStatement: string,
        arguments?: any[],
        callback?: StatementCallback,
        errorCallback?: StatementErrorCallback,
    ): void;
}

type TransactionCallback = (transaction: Transaction) => void;
type TransactionErrorCallback = (error: SQLError) => void;

interface SQLiteDatabase {
    dbname: string;

    transaction(scope: (tx: Transaction) => void): Promise<Transaction>;
    transaction(
        scope: (tx: Transaction) => void,
        error?: TransactionErrorCallback,
        success?: TransactionCallback,
    ): void;
    readTransaction(scope: (tx: Transaction) => void): Promise<Transaction>;
    readTransaction(
        scope: (tx: Transaction) => void,
        error?: TransactionErrorCallback,
        success?: TransactionCallback,
    ): void;
    close(): Promise<void>;
    close(success: () => void, error: (err: SQLError) => void): void;
    executeSql(statement: string, params?: any[]): Promise<[ResultSet]>;
    executeSql(statement: string, params?: any[], success?: StatementCallback, error?: StatementErrorCallback): void;

    attach(nameToAttach: string, alias: string): Promise<void>;
    attach(nameToAttach: string, alias: string, success?: () => void, error?: (err: SQLError) => void): void;

    detach(alias: string): Promise<void>;
    detach(alias: string, success?: () => void, error?: (err: SQLError) => void): void;
}

export interface Spec extends TurboModule {
  DEBUG(isDebug: boolean): void;
  enablePromise(enablePromise: boolean): void;
  openDatabase(params: DatabaseParams): Promise<SQLiteDatabase>;
  
  deleteDatabase(params: DatabaseParams): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SqLitePlugin');