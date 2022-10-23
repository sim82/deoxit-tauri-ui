interface Window {
  greet: () => Promise<void>;
  something: () => Promise<void>;
  update_search: (arg0: boolean) => Promise<void>;
  update_root_path: () => Promise<void>;
}
