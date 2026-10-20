//! VehicleChain — capa de evidencia en Soroban para el historial de
//! mantenimiento vehicular.
//!
//! El CRUD de vehículos, talleres y servicios vive off-chain (PostgreSQL).
//! Este contrato solo guarda lo que debe ser verificable por cualquiera:
//! qué talleres están habilitados, quién es el titular actual de cada
//! historial y el hash de cada servicio publicado. No se guardan datos
//! personales: el vehículo se identifica por un hash (p. ej. SHA-256 del VIN)
//! y cada servicio por su id off-chain y el hash del registro.
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, BytesN, Env, Vec,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const BUMP_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const BUMP_TO: u32 = 120 * DAY_IN_LEDGERS;
/// Máximo de servicios devueltos por página en `get_vehicle_services`.
const MAX_PAGE: u32 = 50;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Workshop(Address),
    Vehicle(BytesN<32>),
    Service(BytesN<32>),
    VehicleService(BytesN<32>, u32),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vehicle {
    pub owner: Address,
    pub registered_at: u64,
    pub service_count: u32,
    pub transfer_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ServiceEvidence {
    pub vehicle_id: BytesN<32>,
    pub workshop: Address,
    pub record_hash: BytesN<32>,
    pub timestamp: u64,
    pub ledger: u32,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    WorkshopNotEnabled = 1,
    VehicleAlreadyRegistered = 2,
    VehicleNotFound = 3,
    ServiceAlreadyPublished = 4,
    ServiceNotFound = 5,
    SameOwner = 6,
}

// ---------- Eventos ----------

#[contractevent]
pub struct WorkshopSet {
    #[topic]
    pub workshop: Address,
    pub enabled: bool,
}

#[contractevent]
pub struct VehicleRegistered {
    #[topic]
    pub vehicle_id: BytesN<32>,
    #[topic]
    pub owner: Address,
}

#[contractevent]
pub struct ServicePublished {
    #[topic]
    pub vehicle_id: BytesN<32>,
    #[topic]
    pub workshop: Address,
    pub service_id: BytesN<32>,
    pub record_hash: BytesN<32>,
}

#[contractevent]
pub struct HistoryTransferred {
    #[topic]
    pub vehicle_id: BytesN<32>,
    pub from: Address,
    pub to: Address,
}

#[contractevent]
pub struct AdminChanged {
    pub old_admin: Address,
    pub new_admin: Address,
}

#[contract]
pub struct VehicleChain;

fn admin(env: &Env) -> Address {
    env.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_TO);
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

fn load_vehicle(env: &Env, vehicle_id: &BytesN<32>) -> Result<Vehicle, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Vehicle(vehicle_id.clone()))
        .ok_or(Error::VehicleNotFound)
}

fn save_persistent<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(
    env: &Env,
    key: &DataKey,
    value: &V,
) {
    let storage = env.storage().persistent();
    storage.set(key, value);
    storage.extend_ttl(key, BUMP_THRESHOLD, BUMP_TO);
}

#[contractimpl]
impl VehicleChain {
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_TO);
    }

    // ---------- Administración ----------

    pub fn get_admin(env: Env) -> Address {
        admin(&env)
    }

    pub fn set_admin(env: Env, new_admin: Address) {
        let old_admin = admin(&env);
        old_admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        AdminChanged { old_admin, new_admin }.publish(&env);
    }

    /// `HU1JA(1)`: el administrador habilita o rechaza un taller. La solicitud
    /// (`HU1JT(1)`) y sus datos quedan off-chain; aquí solo el estado.
    pub fn set_workshop(env: Env, workshop: Address, enabled: bool) {
        admin(&env).require_auth();
        save_persistent(&env, &DataKey::Workshop(workshop.clone()), &enabled);
        WorkshopSet { workshop, enabled }.publish(&env);
    }

    pub fn is_workshop_enabled(env: Env, workshop: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Workshop(workshop))
            .unwrap_or(false)
    }

    // ---------- Vehículos ----------

    /// `HU1JP(1)`: el propietario registra el vehículo (por su hash) y queda
    /// como titular del historial.
    pub fn register_vehicle(env: Env, vehicle_id: BytesN<32>, owner: Address) -> Result<(), Error> {
        owner.require_auth();
        let key = DataKey::Vehicle(vehicle_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::VehicleAlreadyRegistered);
        }
        let vehicle = Vehicle {
            owner: owner.clone(),
            registered_at: env.ledger().timestamp(),
            service_count: 0,
            transfer_count: 0,
        };
        save_persistent(&env, &key, &vehicle);
        VehicleRegistered { vehicle_id, owner }.publish(&env);
        Ok(())
    }

    pub fn get_vehicle(env: Env, vehicle_id: BytesN<32>) -> Result<Vehicle, Error> {
        load_vehicle(&env, &vehicle_id)
    }

    /// `HU4JP(4)`: transfiere la titularidad del historial dentro de
    /// VehicleChain. No es el traspaso jurídico del vehículo y no modifica
    /// los servicios ya publicados.
    pub fn transfer_history(
        env: Env,
        vehicle_id: BytesN<32>,
        new_owner: Address,
    ) -> Result<(), Error> {
        let mut vehicle = load_vehicle(&env, &vehicle_id)?;
        vehicle.owner.require_auth();
        if vehicle.owner == new_owner {
            return Err(Error::SameOwner);
        }
        let from = vehicle.owner.clone();
        vehicle.owner = new_owner.clone();
        vehicle.transfer_count += 1;
        save_persistent(&env, &DataKey::Vehicle(vehicle_id.clone()), &vehicle);
        HistoryTransferred { vehicle_id, from, to: new_owner }.publish(&env);
        Ok(())
    }

    // ---------- Servicios ----------

    /// `HU2JT(2)` + `HU3JT(3)`: un taller habilitado publica la evidencia de
    /// un servicio. El hash del registro off-chain queda fijo: un mismo
    /// `service_id` no se puede volver a publicar ni sobrescribir.
    pub fn publish_service(
        env: Env,
        workshop: Address,
        vehicle_id: BytesN<32>,
        service_id: BytesN<32>,
        record_hash: BytesN<32>,
    ) -> Result<(), Error> {
        workshop.require_auth();
        if !Self::is_workshop_enabled(env.clone(), workshop.clone()) {
            return Err(Error::WorkshopNotEnabled);
        }
        let mut vehicle = load_vehicle(&env, &vehicle_id)?;
        let service_key = DataKey::Service(service_id.clone());
        if env.storage().persistent().has(&service_key) {
            return Err(Error::ServiceAlreadyPublished);
        }

        let evidence = ServiceEvidence {
            vehicle_id: vehicle_id.clone(),
            workshop: workshop.clone(),
            record_hash: record_hash.clone(),
            timestamp: env.ledger().timestamp(),
            ledger: env.ledger().sequence(),
        };
        save_persistent(&env, &service_key, &evidence);
        save_persistent(
            &env,
            &DataKey::VehicleService(vehicle_id.clone(), vehicle.service_count),
            &service_id,
        );
        vehicle.service_count += 1;
        save_persistent(&env, &DataKey::Vehicle(vehicle_id.clone()), &vehicle);

        ServicePublished { vehicle_id, workshop, service_id, record_hash }.publish(&env);
        Ok(())
    }

    pub fn get_service(env: Env, service_id: BytesN<32>) -> Result<ServiceEvidence, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Service(service_id))
            .ok_or(Error::ServiceNotFound)
    }

    /// `HU2JP(2)`: compara el hash del registro off-chain con el publicado.
    pub fn verify_service(
        env: Env,
        service_id: BytesN<32>,
        record_hash: BytesN<32>,
    ) -> Result<bool, Error> {
        Ok(Self::get_service(env, service_id)?.record_hash == record_hash)
    }

    /// Ids de servicios del vehículo en orden de publicación, paginados.
    pub fn get_vehicle_services(
        env: Env,
        vehicle_id: BytesN<32>,
        start: u32,
        limit: u32,
    ) -> Result<Vec<BytesN<32>>, Error> {
        let vehicle = load_vehicle(&env, &vehicle_id)?;
        let end = start.saturating_add(limit.min(MAX_PAGE)).min(vehicle.service_count);
        let mut ids = Vec::new(&env);
        for i in start..end {
            let id: BytesN<32> = env
                .storage()
                .persistent()
                .get(&DataKey::VehicleService(vehicle_id.clone(), i))
                .unwrap();
            ids.push_back(id);
        }
        Ok(ids)
    }
}

mod test;
