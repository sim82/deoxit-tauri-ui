use std::sync::Arc;

use serde::Serialize;
use tauri::{AppHandle, Manager, Wry};

use crate::event::HubEvent;

pub struct Ctx {
    app_handle: AppHandle<Wry>,
}

impl Ctx {
    pub fn from_app(app: AppHandle<Wry>) -> Arc<Ctx> {
        Arc::new(Ctx::new(app))
    }
}

impl Ctx {
    pub fn new(app_handle: AppHandle<Wry>) -> Self {
        Ctx { app_handle }
    }

    // pub fn emit_hub_event<D: Serialize + Clone>(&self, hub_event: HubEvent<D>) {
    pub fn emit_hub_event(&self, hub_event: HubEvent) {
        let _ = self.app_handle.emit_all("HubEvent", hub_event);
    }
}
