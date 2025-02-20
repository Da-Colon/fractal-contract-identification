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
${this.formatTitle(`Searching Network: ${networkName}`)}
`);
  }
  updateNetworkSearch(label: string, data: string | null | undefined, networkName: string): void {
    const progress = this.progressMap.get(networkName) ?? 1;
    console.log(`\n${"⭐️".repeat(progress)} ${ansis.blue(label)}: ${ansis.green(data ?? "--")}`);
    this.progressMap.set(networkName, progress + 1);
  }

  reportTitle(label: string): void {
    console.log(`
${this.formatTitle(label)}`);
  }

  finishNetworkSearch(): void {}
}
