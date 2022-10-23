use serde::Serialize;
use ts_rs::TS;

#[derive(TS, Serialize, Clone)]
#[ts(export, export_to = "../src/bindings/")]
pub struct HubEvent {
    pub index: usize,
    pub path: String,
    pub size: u64,
}
