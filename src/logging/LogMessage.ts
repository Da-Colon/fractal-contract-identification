import ansis from "ansis";
export class LogMessage {
  progressMap: Map<string, number> = new Map();

  private static borders = {
    default: "═".repeat(70),
  };

  formatTitle(title: string) {
    return `
        ${ansis.bold(ansis.blue(title))}
        ${LogMessage.borders.default}`;
  }
}

export class GenerateReportLogs extends LogMessage {
  generateReportStart(networks: string[]) {
    console.log(`
${this.formatTitle("Generating DAO reports for networks:")}
${networks.map((name) => `- ${name}`).join("\n")}
`);
  }

  startNetworkSearch(networkName: string) {
    console.log(`
${this.formatTitle(`\n\nSearching Network: ${networkName}`)}
`);
  }
  updateNetworkSearch(message: string, networkName: string): void {
    const progress = this.progressMap.get(networkName) ?? 0;
    console.log(`\n${"⭐️".repeat(progress)}` + message);
    this.progressMap.set(networkName, progress + 1);
  }

  finishNetworkSearch(): void {}
}
