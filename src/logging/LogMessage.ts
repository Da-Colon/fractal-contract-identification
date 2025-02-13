import ansis from "ansis";
import cliProgress from "cli-progress";
export class LogMessage {
  processBarMap: Map<string, cliProgress.SingleBar> = new Map();

  private static borders = {
    default: "═".repeat(70),
  };

  formatTitle(title: string) {
    return `
        ${ansis.bold(ansis.blue(title))}
        ${LogMessage.borders.default}`;
  }
  startProgressBar(progressLength: number, name?: string) {
    const progressBar = new cliProgress.SingleBar(
      {
        format: `${name ? `${name} | ` : ""}{bar} {percentage}% | {value}/{total}`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic,
    );
    progressBar.start(progressLength, 0);
    this.processBarMap.set(name ?? "default", progressBar);
  }
  updateProgressBar(value: number, name?: string) {
    this.processBarMap.get(name ?? "default")?.update(value);
  }
}

export class GenerateReportLogs extends LogMessage {
  generateReportStart(networks: string[]) {
    console.log(`
      ${this.formatTitle("Generating DAO reports for networks:")}
      ${networks.map((name) => `- ${name}`).join("\n")}
      `);
  }

  startNetworkSearch(networkLength: number) {
    this.startProgressBar(networkLength, "Searching Networks");
  }
  updateNetworkSearch(): void {
    this.processBarMap.get("Searching Networks")?.increment();
  }
  finishNetworkSearch(): void {
    this.processBarMap.get("Searching Networks")?.stop();
  }
}
