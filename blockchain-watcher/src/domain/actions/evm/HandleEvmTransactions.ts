import { HandleEvmConfig } from "./HandleEvmLogs";
import { StatRepository } from "../../repositories";
import {
  EvmTransactionFoundAttributes,
  TransactionFoundEvent,
  EvmTransaction,
} from "../../entities";

/**
 * Handling means mapping and forward to a given target.
 * As of today, we have mapped this event evmFailedRedeemed, evmStandardRelayDelivered and evmTransferRedeemed.
 */
export class HandleEvmTransactions<T> {
  cfg: HandleEvmConfig;
  mapper: (log: EvmTransaction) => T;
  target: (parsed: T[]) => Promise<void>;
  statsRepo: StatRepository;

  constructor(
    cfg: HandleEvmConfig,
    mapper: (log: EvmTransaction) => T,
    target: (parsed: T[]) => Promise<void>,
    statsRepo: StatRepository
  ) {
    this.cfg = this.normalizeCfg(cfg);
    this.mapper = mapper;
    this.target = target;
    this.statsRepo = statsRepo;
  }

  public async handle(transactions: EvmTransaction[]): Promise<T[]> {
    const mappedItems = transactions.map((transaction) => {
      return this.mapper(transaction);
    }) as TransactionFoundEvent<EvmTransactionFoundAttributes>[];

    const filterItems = mappedItems.filter((transaction) => {
      if (transaction) {
        this.report(transaction.attributes.protocol);
        return transaction;
      }
    }) as T[];

    await this.target(filterItems);
    return filterItems;
  }

  private report(protocol: string) {
    const labels = {
      job: this.cfg.id,
      chain: this.cfg.chain ?? "",
      protocol: protocol,
      commitment: this.cfg.commitment,
    };
    this.statsRepo.count(this.cfg.metricName, labels);
  }

  private normalizeCfg(cfg: HandleEvmConfig): HandleEvmConfig {
    return {
      filter: {
        addresses: cfg.filter.addresses.map((addr) => addr.toLowerCase()),
        topics: cfg.filter.topics.map((topic) => topic.toLowerCase()),
      },
      metricName: cfg.metricName,
      commitment: cfg.commitment,
      chain: cfg.chain,
      chainId: cfg.chainId,
      abi: cfg.abi,
      id: cfg.id,
    };
  }
}
