use fs_extra::dir::get_size;
use std::{fs::ReadDir, path::Path, sync::Mutex};
use tokio::sync::mpsc;

pub fn find_cargo_dirs<P: AsRef<Path>>(root: P, indent: &str) {
    let indent = format!("{} ", indent);
    if let Ok(dir) = std::fs::read_dir(root) {
        for ent in dir.filter_map(|e| e.ok()).filter(|e| {
            e.file_type()
                .map_or(false, |e| e.is_dir() && !e.is_symlink())
        }) {
            if ent.file_name() == "target" {
                let size = get_size(ent.path()).unwrap_or_default();
                println!("target dir: {:?} {}", ent, size);
            } else {
                find_cargo_dirs(ent.path(), &indent);
            }
        }
    }
}

pub async fn find_cargo_dirs_channel<P: AsRef<Path>>(root: P, sender: mpsc::Sender<(String, u64)>) {
    let mut stack = vec![root.as_ref().to_owned()];

    tokio::task::spawn_blocking(move || {
        while let Some(root) = stack.pop() {
            if let Ok(dir) = std::fs::read_dir(root) {
                for ent in dir.into_iter().filter_map(|ent| ent.ok()) {
                    match ent.file_type() {
                        Ok(file_type) if file_type.is_dir() && !file_type.is_symlink() => {
                            if ent.file_name() == "target" {
                                let size = get_size(ent.path()).unwrap_or_default();
                                // let size = 0;

                                // println!("target dir: {:?} {}", ent, size);
                                sender
                                    .blocking_send((ent.path().to_string_lossy().to_string(), size))
                                    .unwrap();
                            } else {
                                stack.push(ent.path())
                            }
                        }
                        _ => (),
                    }
                }
            }
        }
    });
}

pub mod x2 {
    use std::path::Path;

    use fs_extra::dir::get_size;
    pub async fn find_cargo_dirs_async<P: AsRef<Path>>(root: P, indent: &str) {
        let mut stack = vec![root.as_ref().to_owned()];

        while let Some(root) = stack.pop() {
            if let Ok(mut dir) = tokio::fs::read_dir(root).await {
                while let Ok(Some(ent)) = dir.next_entry().await {
                    match ent.file_type().await {
                        Ok(file_type) if file_type.is_dir() && !file_type.is_symlink() => {
                            if ent.file_name() == "target" {
                                let size = get_size(ent.path()).unwrap_or_default();
                                // let size = 0;

                                // println!("target dir: {:?} {}", ent, size);
                            } else {
                                stack.push(ent.path())
                            }
                        }
                        _ => (),
                    }
                }
            }
        }
    }
}

pub async fn visit_cargo_dirs_async<P: AsRef<Path>, F: Fn(String, u64) -> ()>(root: P, f: F) {
    let mut stack = vec![root.as_ref().to_owned()];

    while let Some(root) = stack.pop() {
        if let Ok(mut dir) = tokio::fs::read_dir(root).await {
            while let Ok(Some(ent)) = dir.next_entry().await {
                match ent.file_type().await {
                    Ok(file_type) if file_type.is_dir() && !file_type.is_symlink() => {
                        if ent.file_name() == "target" {
                            let size = get_size(ent.path()).unwrap_or_default();
                            // let size = 0;

                            // println!("target dir: {:?} {}", ent, size);
                            f(ent.path().to_string_lossy().to_string(), size);
                        } else {
                            stack.push(ent.path())
                        }
                    }
                    _ => (),
                }
            }
        }
    }
}

pub async fn visit_cargo_dirs_inc_async<P: AsRef<Path>, F: Fn(usize, String, u64) -> ()>(
    root: P,
    f: F,
) {
    let order = Mutex::new(Vec::<u64>::new());

    visit_cargo_dirs_async(root, |name, size| {
        let p = if let Ok(mut cur_list) = order.lock() {
            let p = cur_list.partition_point(|x| *x > size);
            cur_list.insert(p, size);
            p
        } else {
            panic!("failed to lock mutex");
        };
        f(p, name, size)
    })
    .await;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test(flavor = "multi_thread")]
    // #[tokio::test]
    async fn it_works() {
        x2::find_cargo_dirs_async("/home/sim/src", "").await;
    }

    // #[test]
    fn it_works2() {
        find_cargo_dirs("/home/sim/src", "");
    }

    #[tokio::test]
    async fn test_inc() {
        let res = Mutex::new(Vec::new());
        visit_cargo_dirs_inc_async("/home/sim/src", |p, name, size| {
            println!("{} {} {}", p, size, name);
            if let Ok(mut res) = res.lock() {
                res.insert(p, (size, name));
            }
        })
        .await;
        for (size, name) in res.into_inner().unwrap() {
            println!("{} {}", size, name);
        }
    }

    #[tokio::test]
    async fn test_channel() {
        let (sender, mut receiver) = mpsc::channel(64);
        let h = tokio::task::spawn(async move {
            while let Some((path, size)) = receiver.recv().await {
                println!("{} {}", size, path);
            }
        });

        find_cargo_dirs_channel("/home/sim/", sender).await;
        tokio::join!(h);
    }
}
