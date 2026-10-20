#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

struct Setup<'a> {
    env: Env,
    client: VehicleChainClient<'a>,
    admin: Address,
    owner: Address,
    workshop: Address,
    vehicle: BytesN<32>,
}

fn setup() -> Setup<'static> {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let workshop = Address::generate(&env);
    let id = env.register(VehicleChain, (admin.clone(),));
    let client = VehicleChainClient::new(&env, &id);
    let vehicle = BytesN::from_array(&env, &[1; 32]);
    Setup { env, client, admin, owner, workshop, vehicle }
}

fn h(env: &Env, b: u8) -> BytesN<32> {
    BytesN::from_array(env, &[b; 32])
}

#[test]
fn full_flow() {
    let s = setup();
    let c = &s.client;
    assert_eq!(c.get_admin(), s.admin);

    c.set_workshop(&s.workshop, &true);
    assert!(c.is_workshop_enabled(&s.workshop));

    c.register_vehicle(&s.vehicle, &s.owner);
    let service = h(&s.env, 10);
    let record = h(&s.env, 20);
    c.publish_service(&s.workshop, &s.vehicle, &service, &record);

    let ev = c.get_service(&service);
    assert_eq!(ev.vehicle_id, s.vehicle);
    assert_eq!(ev.workshop, s.workshop);
    assert!(c.verify_service(&service, &record));
    assert!(!c.verify_service(&service, &h(&s.env, 21)));

    let new_owner = Address::generate(&s.env);
    c.transfer_history(&s.vehicle, &new_owner);
    let v = c.get_vehicle(&s.vehicle);
    assert_eq!(v.owner, new_owner);
    assert_eq!(v.transfer_count, 1);
    // La transferencia no altera los servicios previos.
    assert_eq!(v.service_count, 1);
    assert_eq!(c.get_vehicle_services(&s.vehicle, &0, &10).len(), 1);
    assert_eq!(c.get_service(&service), ev);
}

#[test]
fn disabled_workshop_cannot_publish() {
    let s = setup();
    let c = &s.client;
    c.register_vehicle(&s.vehicle, &s.owner);
    let r = c.try_publish_service(&s.workshop, &s.vehicle, &h(&s.env, 10), &h(&s.env, 20));
    assert_eq!(r, Err(Ok(Error::WorkshopNotEnabled)));

    c.set_workshop(&s.workshop, &true);
    c.set_workshop(&s.workshop, &false);
    let r = c.try_publish_service(&s.workshop, &s.vehicle, &h(&s.env, 10), &h(&s.env, 20));
    assert_eq!(r, Err(Ok(Error::WorkshopNotEnabled)));
}

#[test]
fn service_cannot_be_overwritten() {
    let s = setup();
    let c = &s.client;
    c.set_workshop(&s.workshop, &true);
    c.register_vehicle(&s.vehicle, &s.owner);
    c.publish_service(&s.workshop, &s.vehicle, &h(&s.env, 10), &h(&s.env, 20));
    let r = c.try_publish_service(&s.workshop, &s.vehicle, &h(&s.env, 10), &h(&s.env, 99));
    assert_eq!(r, Err(Ok(Error::ServiceAlreadyPublished)));
    assert!(c.verify_service(&h(&s.env, 10), &h(&s.env, 20)));
}

#[test]
fn vehicle_rules() {
    let s = setup();
    let c = &s.client;
    c.register_vehicle(&s.vehicle, &s.owner);
    assert_eq!(
        c.try_register_vehicle(&s.vehicle, &Address::generate(&s.env)),
        Err(Ok(Error::VehicleAlreadyRegistered))
    );
    assert_eq!(c.try_transfer_history(&s.vehicle, &s.owner), Err(Ok(Error::SameOwner)));
    assert_eq!(
        c.try_transfer_history(&h(&s.env, 7), &s.owner),
        Err(Ok(Error::VehicleNotFound))
    );
    assert_eq!(c.try_get_service(&h(&s.env, 7)), Err(Ok(Error::ServiceNotFound)));
}

#[test]
fn transfer_requires_current_owner_auth() {
    let s = setup();
    let c = &s.client;
    c.register_vehicle(&s.vehicle, &s.owner);
    let new_owner = Address::generate(&s.env);
    c.transfer_history(&s.vehicle, &new_owner);
    let auths = s.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, s.owner);
}

#[test]
fn only_admin_sets_workshops() {
    let s = setup();
    s.client.set_workshop(&s.workshop, &true);
    let auths = s.env.auths();
    assert_eq!(auths[0].0, s.admin);
}

#[test]
#[should_panic]
fn set_workshop_without_auth_fails() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let id = env.register(VehicleChain, (admin,));
    let client = VehicleChainClient::new(&env, &id);
    client.set_workshop(&Address::generate(&env), &true);
}
