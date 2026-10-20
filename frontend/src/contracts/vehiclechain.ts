import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCYAXY4SVKDJYG74FN2GHOTKSGFERB6BZFGOIISWQCO5QMDHETMXNZDP",
  }
} as const

export const Errors = {
  1: {message:"WorkshopNotEnabled"},
  2: {message:"VehicleAlreadyRegistered"},
  3: {message:"VehicleNotFound"},
  4: {message:"ServiceAlreadyPublished"},
  5: {message:"ServiceNotFound"},
  6: {message:"SameOwner"}
}


export interface Vehicle {
  owner: string;
  registered_at: u64;
  service_count: u32;
  transfer_count: u32;
}




export interface ServiceEvidence {
  ledger: u32;
  record_hash: Buffer;
  timestamp: u64;
  vehicle_id: Buffer;
  workshop: string;
}




export interface Client {
  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin: ({new_admin}: {new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_service transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_service: ({service_id}: {service_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<ServiceEvidence>>>

  /**
   * Construct and simulate a get_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_vehicle: ({vehicle_id}: {vehicle_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Vehicle>>>

  /**
   * Construct and simulate a set_workshop transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * `HU1JA(1)`: el administrador habilita o rechaza un taller. La solicitud
   * (`HU1JT(1)`) y sus datos quedan off-chain; aquí solo el estado.
   */
  set_workshop: ({workshop, enabled}: {workshop: string, enabled: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a verify_service transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * `HU2JP(2)`: compara el hash del registro off-chain con el publicado.
   */
  verify_service: ({service_id, record_hash}: {service_id: Buffer, record_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a publish_service transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * `HU2JT(2)` + `HU3JT(3)`: un taller habilitado publica la evidencia de
   * un servicio. El hash del registro off-chain queda fijo: un mismo
   * `service_id` no se puede volver a publicar ni sobrescribir.
   */
  publish_service: ({workshop, vehicle_id, service_id, record_hash}: {workshop: string, vehicle_id: Buffer, service_id: Buffer, record_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a register_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * `HU1JP(1)`: el propietario registra el vehículo (por su hash) y queda
   * como titular del historial.
   */
  register_vehicle: ({vehicle_id, owner}: {vehicle_id: Buffer, owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a transfer_history transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * `HU4JP(4)`: transfiere la titularidad del historial dentro de
   * VehicleChain. No es el traspaso jurídico del vehículo y no modifica
   * los servicios ya publicados.
   */
  transfer_history: ({vehicle_id, new_owner}: {vehicle_id: Buffer, new_owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a is_workshop_enabled transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_workshop_enabled: ({workshop}: {workshop: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_vehicle_services transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Ids de servicios del vehículo en orden de publicación, paginados.
   */
  get_vehicle_services: ({vehicle_id, start, limit}: {vehicle_id: Buffer, start: u32, limit: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Array<Buffer>>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin}: {admin: string},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAASV29ya3Nob3BOb3RFbmFibGVkAAAAAAABAAAAAAAAABhWZWhpY2xlQWxyZWFkeVJlZ2lzdGVyZWQAAAACAAAAAAAAAA9WZWhpY2xlTm90Rm91bmQAAAAAAwAAAAAAAAAXU2VydmljZUFscmVhZHlQdWJsaXNoZWQAAAAABAAAAAAAAAAPU2VydmljZU5vdEZvdW5kAAAAAAUAAAAAAAAACVNhbWVPd25lcgAAAAAAAAY=",
        "AAAAAQAAAAAAAAAAAAAAB1ZlaGljbGUAAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA1yZWdpc3RlcmVkX2F0AAAAAAAABgAAAAAAAAANc2VydmljZV9jb3VudAAAAAAAAAQAAAAAAAAADnRyYW5zZmVyX2NvdW50AAAAAAAE",
        "AAAABQAAAAAAAAAAAAAAC1dvcmtzaG9wU2V0AAAAAAEAAAAMd29ya3Nob3Bfc2V0AAAAAgAAAAAAAAAId29ya3Nob3AAAAATAAAAAQAAAAAAAAAHZW5hYmxlZAAAAAABAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAADEFkbWluQ2hhbmdlZAAAAAEAAAANYWRtaW5fY2hhbmdlZAAAAAAAAAIAAAAAAAAACW9sZF9hZG1pbgAAAAAAABMAAAAAAAAAAAAAAAluZXdfYWRtaW4AAAAAAAATAAAAAAAAAAI=",
        "AAAAAQAAAAAAAAAAAAAAD1NlcnZpY2VFdmlkZW5jZQAAAAAFAAAAAAAAAAZsZWRnZXIAAAAAAAQAAAAAAAAAC3JlY29yZF9oYXNoAAAAA+4AAAAgAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAGAAAAAAAAAAp2ZWhpY2xlX2lkAAAAAAPuAAAAIAAAAAAAAAAId29ya3Nob3AAAAAT",
        "AAAABQAAAAAAAAAAAAAAEFNlcnZpY2VQdWJsaXNoZWQAAAABAAAAEXNlcnZpY2VfcHVibGlzaGVkAAAAAAAABAAAAAAAAAAKdmVoaWNsZV9pZAAAAAAD7gAAACAAAAABAAAAAAAAAAh3b3Jrc2hvcAAAABMAAAABAAAAAAAAAApzZXJ2aWNlX2lkAAAAAAPuAAAAIAAAAAAAAAAAAAAAC3JlY29yZF9oYXNoAAAAA+4AAAAgAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAEVZlaGljbGVSZWdpc3RlcmVkAAAAAAAAAQAAABJ2ZWhpY2xlX3JlZ2lzdGVyZWQAAAAAAAIAAAAAAAAACnZlaGljbGVfaWQAAAAAA+4AAAAgAAAAAQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAQAAAAI=",
        "AAAABQAAAAAAAAAAAAAAEkhpc3RvcnlUcmFuc2ZlcnJlZAAAAAAAAQAAABNoaXN0b3J5X3RyYW5zZmVycmVkAAAAAAMAAAAAAAAACnZlaGljbGVfaWQAAAAAA+4AAAAgAAAAAQAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAAC",
        "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAALZ2V0X3NlcnZpY2UAAAAAAQAAAAAAAAAKc2VydmljZV9pZAAAAAAD7gAAACAAAAABAAAD6QAAB9AAAAAPU2VydmljZUV2aWRlbmNlAAAAAAM=",
        "AAAAAAAAAAAAAAALZ2V0X3ZlaGljbGUAAAAAAQAAAAAAAAAKdmVoaWNsZV9pZAAAAAAD7gAAACAAAAABAAAD6QAAB9AAAAAHVmVoaWNsZQAAAAAD",
        "AAAAAAAAAIhgSFUxSkEoMSlgOiBlbCBhZG1pbmlzdHJhZG9yIGhhYmlsaXRhIG8gcmVjaGF6YSB1biB0YWxsZXIuIExhIHNvbGljaXR1ZAooYEhVMUpUKDEpYCkgeSBzdXMgZGF0b3MgcXVlZGFuIG9mZi1jaGFpbjsgYXF1w60gc29sbyBlbCBlc3RhZG8uAAAADHNldF93b3Jrc2hvcAAAAAIAAAAAAAAACHdvcmtzaG9wAAAAEwAAAAAAAAAHZW5hYmxlZAAAAAABAAAAAA==",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAERgSFUySlAoMilgOiBjb21wYXJhIGVsIGhhc2ggZGVsIHJlZ2lzdHJvIG9mZi1jaGFpbiBjb24gZWwgcHVibGljYWRvLgAAAA52ZXJpZnlfc2VydmljZQAAAAAAAgAAAAAAAAAKc2VydmljZV9pZAAAAAAD7gAAACAAAAAAAAAAC3JlY29yZF9oYXNoAAAAA+4AAAAgAAAAAQAAA+kAAAABAAAAAw==",
        "AAAAAAAAAMJgSFUySlQoMilgICsgYEhVM0pUKDMpYDogdW4gdGFsbGVyIGhhYmlsaXRhZG8gcHVibGljYSBsYSBldmlkZW5jaWEgZGUKdW4gc2VydmljaW8uIEVsIGhhc2ggZGVsIHJlZ2lzdHJvIG9mZi1jaGFpbiBxdWVkYSBmaWpvOiB1biBtaXNtbwpgc2VydmljZV9pZGAgbm8gc2UgcHVlZGUgdm9sdmVyIGEgcHVibGljYXIgbmkgc29icmVzY3JpYmlyLgAAAAAAD3B1Ymxpc2hfc2VydmljZQAAAAAEAAAAAAAAAAh3b3Jrc2hvcAAAABMAAAAAAAAACnZlaGljbGVfaWQAAAAAA+4AAAAgAAAAAAAAAApzZXJ2aWNlX2lkAAAAAAPuAAAAIAAAAAAAAAALcmVjb3JkX2hhc2gAAAAD7gAAACAAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAGJgSFUxSlAoMSlgOiBlbCBwcm9waWV0YXJpbyByZWdpc3RyYSBlbCB2ZWjDrWN1bG8gKHBvciBzdSBoYXNoKSB5IHF1ZWRhCmNvbW8gdGl0dWxhciBkZWwgaGlzdG9yaWFsLgAAAAAAEHJlZ2lzdGVyX3ZlaGljbGUAAAACAAAAAAAAAAp2ZWhpY2xlX2lkAAAAAAPuAAAAIAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAKBgSFU0SlAoNClgOiB0cmFuc2ZpZXJlIGxhIHRpdHVsYXJpZGFkIGRlbCBoaXN0b3JpYWwgZGVudHJvIGRlClZlaGljbGVDaGFpbi4gTm8gZXMgZWwgdHJhc3Bhc28ganVyw61kaWNvIGRlbCB2ZWjDrWN1bG8geSBubyBtb2RpZmljYQpsb3Mgc2VydmljaW9zIHlhIHB1YmxpY2Fkb3MuAAAAEHRyYW5zZmVyX2hpc3RvcnkAAAACAAAAAAAAAAp2ZWhpY2xlX2lkAAAAAAPuAAAAIAAAAAAAAAAJbmV3X293bmVyAAAAAAAAEwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAATaXNfd29ya3Nob3BfZW5hYmxlZAAAAAABAAAAAAAAAAh3b3Jrc2hvcAAAABMAAAABAAAAAQ==",
        "AAAAAAAAAENJZHMgZGUgc2VydmljaW9zIGRlbCB2ZWjDrWN1bG8gZW4gb3JkZW4gZGUgcHVibGljYWNpw7NuLCBwYWdpbmFkb3MuAAAAABRnZXRfdmVoaWNsZV9zZXJ2aWNlcwAAAAMAAAAAAAAACnZlaGljbGVfaWQAAAAAA+4AAAAgAAAAAAAAAAVzdGFydAAAAAAAAAQAAAAAAAAABWxpbWl0AAAAAAAABAAAAAEAAAPpAAAD6gAAA+4AAAAgAAAAAw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_admin: this.txFromJSON<string>,
        set_admin: this.txFromJSON<null>,
        get_service: this.txFromJSON<Result<ServiceEvidence>>,
        get_vehicle: this.txFromJSON<Result<Vehicle>>,
        set_workshop: this.txFromJSON<null>,
        verify_service: this.txFromJSON<Result<boolean>>,
        publish_service: this.txFromJSON<Result<void>>,
        register_vehicle: this.txFromJSON<Result<void>>,
        transfer_history: this.txFromJSON<Result<void>>,
        is_workshop_enabled: this.txFromJSON<boolean>,
        get_vehicle_services: this.txFromJSON<Result<Array<Buffer>>>
  }
}