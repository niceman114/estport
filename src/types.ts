export type Process = {
  pid: string;
  command: string;
};

export type ScanResult = {
  success: boolean;
  message?: string;
  data: Array<Process>;
};
