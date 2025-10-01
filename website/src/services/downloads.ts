export interface DownloadOption {
  id: string;
  fileName: string;
  label: string;
}

export const DOWNLOAD_FILES: Record<string, DownloadOption> = {
  latestSoftware: {
    id: 'software-142',
    fileName: 'AOMtrading_1.4.2.zip',
    label: 'Download',
  },
  previousSoftware: {
    id: 'software-141',
    fileName: 'AOMtrading_1.4.10.zip',
    label: 'Download',
  },
  latestCharts: {
    id: 'charts-142',
    fileName: 'Chart_templates_1.4.2.zip',
    label: 'Download Chart Templates',
  },
  previousCharts: {
    id: 'charts-141',
    fileName: 'Chart_templates_1.4.10.zip',
    label: 'Download Chart Templates',
  },
};
