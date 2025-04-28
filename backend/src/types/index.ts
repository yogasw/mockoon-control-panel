export interface MockInstance {
    process: any;
    configFile: string;
    startTime: Date;
    logFile: any;
    uuid: string;
}

export interface MockStatus {
    port: number;
    configFile: string;
    uptime: number;
    uptimeFormatted: string;
}

export interface ApiResponse<T = any> {
    success?: boolean;
    error?: string;
    message?: string;
    data?: T;
    status?: string;
}

export interface UploadResponse {
    success: boolean;
    filename: string;
    message: string;
}

export interface StartMockResponse {
    success: boolean;
    uuid: string;
    port: number;
    configFile: string;
    message: string;
}

export interface StopMockResponse {
    success: boolean;
    port: number;
    message: string;
}
