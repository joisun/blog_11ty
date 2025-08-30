---
title: Git Tips
date: 2024-02-05
tags:
  - Git
  - 版本控制
  - Cheat_Sheet
---

## **Hot Tips**



| 说明                      | 命令                                                         | 示例                                                         |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 从本地推送并创建远程分支  | `git push <远程主机名> <本地分支名>:<远程分支名>`<br />如果远程主机中没有对应的分支,则会新建该分支。 | `git push sunzy dev:dev`                                     |
|                           | 也可以通过`-u`或`--set-upstream`选项设置关联关系,这样以后就可以直接使用`git push`来推送本地分支了:<br />`git push -u origin dev`<br />此外,也可以使用`git push origin :dev`的方式删除远程的分支。 |                                                              |
| `--no-ff` 合并            | `git merge` 和 `git merge --no-ff` 都是用来合并 branch 的命令，在使用上存在一些差异。<br />1.`git merge`：在默认情况下，Git执行"Fast-forward"模式，如果被合并的 branch 比当前的 branch 更新（在提交历史上在前），那么 Git 只会简单地把 HEAD 指针指向被合并的 branch，这就是快进（fast-forward）合并。这种方式下，合并的信息并不会体现在commit历史中。<br />2.`git merge --no-ff`：--no-ff参数意味着"no fast forward"，禁用"Fast-forward"模式。即使被合并的 branch 比当前的 branch 更新，Git 在合并时也会创建一个新的 commit 对象，并把两个 branch 的最新 commit 作为这个新 commit 的 parents。这样可以在历史记录中明确地看到分支与合并的情况，更清晰的保留项目历史和合并信息。在团队协作中，`git merge --no-ff` 更为推荐，因为这样可以清楚地看到项目的分支和合并历史。 | `git merge <target branch> --no-ff -m "为合并这个操作附加一段commit msg"` |
| 临时bug修复               | 有时候，突然接到一个紧急修复线上bug的任务， 这时候肯定需要新建一个专用于修复bug的分支， 但是当前分支上的工作还没有完成，或者不便于立即提交当前工作以保持工作的连续性。  这时候我们可以使用 git 提供的 暂存工作区的功能。 <br />1. `git stash` 暂存当前工作区<br />2. `git stash list` 查看当前暂存的工作区<br />3.恢复工作区有两种方式， 第一种是 `git stash apply`恢复，然后删除 stash，`git stash  drop`; 另一种是直接恢复并删除stash, `git stash pop`<br />4. `git stash list` 是查看所有stash 的列表， 意味着 `git stash` 可以多次执行， 想要恢复到指定版本的stash , 可以这样 `git stash apply stash@{stash序号}` |                                                              |
| cherry-pick               | 有时候，在某个分支上做了某些细微改动，但是当前在另一个分支上，例如我在主分支上提交了bug修复，当我当前在dev分支上， 这个分支上也有这个bug没修复， 这时候，可以直接把那个修复bug的commit复制过来， 这个行为称为 `cherry-pick` | `git cherry-pick 4c805e2`, 后面的编号就是commit id           |
| 修改默认分支master为 main | 1. 修改本地分支： `git branch -m master main`<br />2. 创建远程新分支main: `git push -u origin main`<br />3. 删除远程 master 分支：`git push origin --delete master`<br /><br />其他人：<br />1. 切换到master 分支： `git checkout master`<br />2. 重命名为 main: `git branch -m master main`<br />3. 拉取最新commits和分支：`git fetch`<br />4. 移除远程追踪分支：`git branch --unset-upstream`<br />5. 创建新的对远程main分支的追踪： `git branch -u origin/main` |                                                              |



## **版本管理**

| 说明                                                         | 命令                          | 示例 |
| ------------------------------------------------------------ | ----------------------------- | ---- |
| 查看历史提交记录                                             | `git log`                     |      |
| 查看历史提交记录，单行显示                                   | `git log --pretty=oneline`    |      |
| 将当前仓库回退到上个版本                                     | `git reset --hard HEAD^`      |      |
| 将当前仓库回退到上上个版本                                   | `git reset --hard HEAD^^`     |      |
| 将当前仓库回退到上 N 个版本                                  | `git reset --hard HEAD~n`     |      |
| 将当前仓库指向到特定版本                                     | `git reset --hard <commitId>` |      |
| 如果回退到某个历史版本后，那么自该历史版本之后的新版本，通过 `git log` 命令就看不见了，这时候如果需要重新回到某个新的版本，需要知道对应的 commit id, 可以通过 git reflog 命令查找所有的版本变更记录，从而找到 commit id，然后使用 `reset` 命令就可以切换到指定版本 | `git reflog`                  |      |



## **撤销修改**

| 说明                                                         | 命令                                                         | 示例 |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ---- |
| 撤销当前工作区单文件修改                                     | `git checkout -- <file>`                                     |      |
| 撤销删除，如果意外删除了某个文件，也可以用`checkout -- `命令恢复 | `rm -f <file>`<br />`git checkout -- <file>`                 |      |
| 撤销当前工作区所有修改                                       | `git checkout -- .`                                          |      |
| 撤销暂存区单文件修改, 注意撤销后的文件修改不会丢失，而是回到工作区，变成modified 状态 | `git restore --staged <file>`<br />或者<br />`git reset HEAD <file>`<br /><br />二者主要区别在于主要的区别在于`git restore --staged <file>`会恢复暂存区中的更改到工作目录中，而`git reset HEAD <file>`则是将暂存区中的文件状态重置为与最新提交相同，但不会影响工作目录中的文件。 |      |
| 撤销暂存区所有文件修改，注意撤销后的文件修改不会丢失，而是回到工作区，变成modified 状态 | `git restore --staged .`                                     |      |

> 当确定删除某个文件后， 需要 `git add <file>` 以暂存这个 “删除操作”， 然后才能 `commit`, 这个操作等同于直接使用`git rm` 删除文件。 



## **分支管理**

| 说明                       | 命令                                                         | 示例 |
| -------------------------- | ------------------------------------------------------------ | ---- |
| 查看分支                   | `git branch`仅查看本地分支, `git branch -a`查看所有分支，包括远程分支 |      |
| 创建并切换分支             | `git checkout -b <new branch name>`, 或者 `git switch -c <new branch name>` |      |
| 切换分支                   | `git checkout <branch>`， 或者 `git switch <branch>`         |      |
| 合并分支                   | `git merge <target branch>`, 将目标分支合并到当前分支        |      |
| 删除分支                   | `git branch -d <target branch>`                              |      |
| 变基                       | `git rebase`                                                 |      |
| 分支临时切换，工作区域暂存 | 主要通过 `git stash` 命令，将所有修改（包括已暂存和未暂存的内容）保存到暂存区，并清理当前工作目录。<br />注意⚠️：该命令默认情况下，git stash 只保存已跟踪文件（tracked files）的修改， 如果需要保存 untracked 文件的修改，需要加上 `--include-untracked` 或 `-u` 选项。 <br />`git stash show` 命令可以查看当前保存的文件<br />`git stash pop` 将保存的文件弹出到当前工作区。<br /><br />最简单的操作流程是：<br /><br />当前分支在 feature-branch <br />git stash --include-untracked：保存所有修改。 <br />git checkout hotfix-branch：切换分支。 <br />处理完需求后，git checkout feature-branch。 <br />git stash pop：恢复修改。 ||



## **冲突管理**

> 冲突发生在分支合并时， 例如a,b 两个分支同时修改了同一个文件， 在合并的时候就会产生冲突， 冲突发生时，该目标文件会被修改。 例如：
> ```
> 1 <<<<<<< HEAD
> 2 hello file02 world
> 3 =======
> 4 hello world file02
> 5 >>>>>>> newbranch
> 6 asdas
> ```
>
> 这时候，需要手动去修正这个文件，然后提交，就可以修复冲突。 如果不修改， 直接`git add .` 然后 `commit`, 那么这份冲突的文件就会被直接提交， 包含这些 `<<<<....`,`===` 表示冲突的标记。各类编辑器携带的冲突编辑器只是帮我们便捷处理这个过程。  

| 说明                 | 命令                               | 示例 |
| -------------------- | ---------------------------------- | ---- |
| 查看分支图           | `git log --graph`                  |      |
| 单行格式化查看分支图 | `git log --graph --pretty=oneline` |      |
|                      |                                    |      |

## 仓库管理

| 说明                   | 命令             | 示例 | 备注 |
| ---------------------- | ---------------- | ---- | ---- |
| 查看当前仓库的远程列表 | ` git remote -v` |      |      |
|                        |                  |      |      |
|                        |                  |      |      |



## 远程仓库管理

| 说明                                       | 命令                                                         | 示例                                                         | 备注                                                         |
| ------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 拉取远程仓库信息，同步到本地               | `git fetch origin`                                           |                                                              | **同步远程信息**：它确保你本地的远程跟踪分支（如 origin/main）与远程仓库的实际状态保持一致<br />**不影响本地工作**：它不会修改你当前的工作目录、本地分支或暂存区。你需要后续手动合并或检出这些更改。<br />**git pull**：相当于 git fetch + git merge。它不仅下载远程数据，还会尝试将这些更改合并到当前本地分支。 |
| 添加新的远程仓库                           | `git remote add <Origin_Name> <Git_Url>`                     | `git remote add gitee git@gitee.com:jaycesun/example.git`    |                                                              |
| 推送当前分支到新的仓库                     | 确保当前分支已经切换，后直接执行`git push <Origin_Name>`     |                                                              |                                                              |
| 推送本地分支到某个远程仓库特定分支         | `git remote add <Origin_Name> <Git_Url>`<br />`git push <Origin_Name> <Local_BranchX>:<Remove_BranchX>` | `git push gitee main:main`                                   |                                                              |
| 推送所有当前**本地**仓库分支到新的远程仓库 | `git remote add <Origin_Name> <Git_Url>`<br />`git push <Origin_Name> --all` |                                                              |                                                              |
| 推送所有远程分支到新的远程仓库             | `git remote add <Origin_Name> <Git_Url>`<br />`git fetch origin`<br />`git push <new-origin> "refs/remotes/origin/*:refs/heads/*"` |                                                              | 注意⚠️： 这不等同于完全仓库同步，仓库同步详见下面的专项说明内容。 |
| 查看远程仓库                               | `git remote -v`                                              |                                                              |                                                              |
| 修改远程仓库地址                           | `git remote set-url <Origin_Name> <Git_Url>`                 | `git remote set-url origin https://github.com/OWNER/REPOSITORY.git` |                                                              |
| 修改远程仓库名称                           | `git remote rename  <Origin_Name> <New_Origin_Name>`         | `git remote rename origin destination`                       |                                                              |
| 删除远程仓库配置·                          | `git remote rm <Origin_Name>`                                | `git remote rm gitee`                                        |                                                              |
| 查看仓库的引用列表                         | `git ls-remote <Origin_Name>`                                |                                                              |                                                              |

### 关于仓库同步

有的时候，我们需要将一个仓库完全同步到一个新的仓库。 

```bash
git remote add <new-origin> <url> #用于将新的远程仓库 <new-origin> 添加到本地仓库的远程列表中
git fetch origin # 更新本地的 远程分支状态 refs/remotes/origin/* 和 标签refs/tags/*
git push <new-origin> --mirror # 将本地仓库的所有引用（refs/*）镜像推送至 <new-origin>
git push <new-origin> "refs/remotes/origin/*:refs/heads/*" # 本地 refs/remotes/origin/*（从 origin 获取的远程跟踪分支）推送为 <new-origin> 的 refs/heads/*，即将 origin 的分支（如 refs/remotes/origin/dev）转换为 <new-origin> 的分支（如 refs/heads/dev）
```

其中，如果要知道一些步骤具体做了什么，下面是详细说明：

1. **`git push <new-origin> --mirror`**
   1. 作用：将本地仓库的整个引用空间（`refs/*`）镜像到 `<new-origin>`, 包括本地分支(`refs/heads/*`)、远程跟踪分支(`refs/remotes/*`)、标签（`refs/tags/*`） 等。 
   2. 依赖：这个操作只依赖本地仓库当前的引用状态，不和远程仓库 `origin` 交互，这也是为什么在这之前需要 `git fetch origin` 的原因，如果 `origin` 自上次 `git fetch` 后有新分支或更新，而你希望这些最新内容也镜像到 `<new-origin>`。否则，`<new-origin>` 只会收到你本地当前的（可能过时的）引用。
2. **`git push <new-origin> "refs/remotes/origin/*:refs/heads/*"`** 
   1. 作用： 将本地仓库的 `refs/remotes/origin/*`（远程跟踪分支，例如 `refs/remotes/origin/feature/ack-test`）推送为 `<new-origin> `的 `refs/heads/*`（分支，例如 `refsHeaders/feature/ack-test`）。如果不执行这个操作，那么远程仓库上不会展示这些远程分支，不过有隐藏的`refs/remotes/*` 信息，分支指的是`refs/heads/*`, `refs/remotes/*` 值得是远程分支的引用。 
   2. 依赖：直接依赖本地 refs/remotes/origin/* 的内容，这同样也是为什么需要在这之前需要 `git fetch origin` 的原因,因为如果 `origin` 有新分支或提交，我们也希望这些最新内容也被推送为 `<new-origin>` 的分支

所以，如果我们其实不需要非常完全的仓库复制，只推送必要引用，保持新仓库干净，我们可以通过下面这种方式同步仓库：
```bash
git remote add new-origin <url>
git fetch origin
git push new-origin --all             # 同步所有本地分支
git push new-origin "refs/remotes/origin/*:refs/heads/*"  # 同步 origin 分支
git push new-origin --tags            # 同步所有标签
```





---



## Git 极速指北 - @joisun

### Git 的核心概念
理解 Git 的几个关键概念，能让你在操作时事半功倍。

#### 引用（Reference）
引用是指向提交（commit）的指针，是 Git 管理历史的基础。类型包括：
- **分支（`refs/heads/*`）**：可变指针，随提交更新。例如 `master` 或 `feature/new`，新提交时自动指向最新 commit。
- **远程跟踪分支（`refs/remotes/*`）**：只读镜像，反映远程状态。例如 `origin/master`，通过 `git fetch` 更新。
- **标签（`refs/tags/*`）**：固定指针，标记特定版本。例如 `v1.0`，不会随提交移动。
- **HEAD**：当前工作位置，可能是分支（如 `refs/heads/master`）或某个提交（分离头状态）。

**实践意义**：知道引用类型，就能明白 `git push` 或 `git fetch` 在操作什么。例如，推送分支是操作 `refs/heads/*`，而 `origin/master` 是远程的影子。

#### 工作区、暂存区和仓库
- **工作区**：你编辑文件的目录。
- **暂存区**：用 `git add` 暂存更改，准备提交。
- **仓库**：提交后的历史，存储在 `.git` 中。

**实践意义**：这三个区域是操作的基础。例如，忘了 `git add`，提交就不会包含更改；用 `git restore` 可以撤销工作区修改。

#### 提交（Commit）
提交是 Git 的最小历史单位，包含：
- SHA-1 哈希值（唯一标识）。
- 快照（记录文件状态）。
- 提交信息。

**实践意义**：提交是回滚和协作的基石，写好提交信息（如 `fix: resolve login bug`）能让历史更清晰。



#### “更新远程跟踪”是什么意思？

在 Git 中，“远程跟踪”（upstream）是指本地分支与远程分支之间的关联关系。具体来说：

- 一个本地分支（如 feature/new）可以设置一个“上游分支”（upstream branch），通常是远程仓库中的某个分支（如 origin/feature/new）。
- 这个关联告诉 Git：
  - git push 时默认推送到的远程分支。
  - git pull 时默认拉取的远程分支。
  - git status 时显示与远程分支的差异（如“领先 2 个提交”）。

“更新远程跟踪”是指调整或重新建立本地分支与远程分支的这种关联关系，尤其是在远程分支名称发生变化时（例如重命名后），确保本地分支仍然正确指向新的远程分支。





### Git 常规工作流
以下是一个典型的单人或团队工作流，假设你在 `my-project` 仓库中。

#### 初始化与首次提交
```bash
git init
echo "Hello" > README.md
git add README.md
git commit -m "Initial commit"
```

#### 分支开发
1. 创建并切换分支：
   ```bash
   git checkout -b feature/add-login
   ```
2. 修改代码，提交：
   ```bash
   git add .
   git commit -m "Add login page"
   ```

#### 同步远程
1. 添加远程仓库：
   ```bash
   git remote add origin <url>
   ```
2. 推送分支：
   ```bash
   git push origin feature/add-login
   ```

#### 合并到主分支
1. 切换回主分支：
   ```bash
   git checkout master
   ```
2. 获取远程更新：
   ```bash
   git pull origin master
   ```
3. 合并分支：
   ```bash
   git merge feature/add-login
   ```
4. 推送主分支：
   ```bash
   git push origin master
   ```

**实践贴士**：
- 经常运行 `git status` 检查状态。
- 用 `git fetch origin` + `git log origin/master` 查看远程变化再决定合并。

### 常见操作详解
以下是开发中高频使用的操作，带你理解用法和场景。

#### Merge vs Rebase：合并还是变基？
- **Merge（合并）**：
  - 命令：`git merge feature/add-login`
  - 作用：将 `feature/add-login` 的更改合并到当前分支，保留分支历史，生成合并提交。
  - 场景：团队协作，想保留完整历史。
  - 输出示例（`git log --graph`）：
    ```
    *   Merge branch 'feature/add-login'
    |\
    | * Add login page
    * | Main branch commit
    ```

- **Rebase（变基）**：
  - 命令：`git rebase master`（在 `feature/add-login` 上运行）
  - 作用：将当前分支的提交“移动”到 `master` 最新提交之上，历史线性化。
  - 场景：个人分支，想保持干净历史。
  - 输出示例：
    ```
    * Add login page
    * Main branch commit
    ```

- **实践选择**：
  - 用 `merge`：历史复杂但真实。
  - 用 `rebase`：历史简洁但可能需要解决冲突。
  - 冲突解决后：`git rebase --continue`。

#### Cherry-pick：挑拣提交
- **命令**：
  ```bash
  git cherry-pick <commit-hash>
  ```
- **作用**：将某个提交应用到当前分支。
- **场景**：只想拿某个 bug 修复，不合并整个分支。
- **示例**：
  - `feature/bugfix` 有提交 `a1b2c3d4` 修复了登录问题。
  - 在 `master` 上：
    ```bash
    git cherry-pick a1b2c3d4
    ```
  - 结果：登录修复应用到 `master`。

**实践贴士**：用 `git log` 找哈希，冲突时手动解决后 `git cherry-pick --continue`。

#### 撤销与修复
- **撤销工作区更改**：改了文件，想丢弃
  
  ```bash
  git restore <file>  # 丢弃单个文件更改
  git restore .       # 丢弃所有未暂存更改
  ```
  
  > **注意**：未 git add 的更改会被丢弃，无法恢复。
  
- **撤销暂存区内容**:  git add 后反悔

  ```bash
  git restore --staged <file>  # 取消暂存
  ```

- **撤销提交（保留更改）**：刚提交，但是还没有push, 想重新编辑
  
  ```bash
  git reset --soft HEAD^  # 回退一个提交，保留更改到暂存区
  git reset --mixed HEAD^  # 回退一个提交，保留更改到工作区（默认）
  ```
  
  > `--soft` 适合微调后重新提交，`--mixed` 适合大改
  
- **完全回滚**：提交错了，想彻底删除
  
  ```bash
  git reset --hard HEAD^  # 回退一个提交，丢弃上一次所有更改
  git reset --hard <commit>  # 回退到特定提交，丢弃掉自该节点之后所有的变更
  ```
  
- **撤销已推送的提交**：push 后发现有问题，又不想重新创建污染提交
  
  ```bash
  git revert <commit>  # 创建反向提交
  git push origin master # 假设需要推送到 origin 的 master 分支
  ```
  
  > git revert 是最安全的方法，尤其适用于多人协作的项目，因为它不会重写历史记录。 不过这个操作会留下一个 revert 的commit， 如果不想这样， 可以 用 `git reset --soft` 回滚后修改完提交后，再 `git push --force`，但需团队配合。 如果就你自己一个人开发，那随便用。[Git 强制执行 reset 可能会导致什么问题？](https://sunzy.fun/blog_11ty/posts/Others/2024-02-12-git_%E5%BC%BA%E5%88%B6%E6%89%A7%E8%A1%8C_reset_%E5%8F%AF%E8%83%BD%E4%BC%9A%E5%AF%BC%E8%87%B4%E4%BB%80%E4%B9%88%E9%97%AE%E9%A2%98%EF%BC%9F/)
  
- **修改最后一次提交**：提交后发现漏加文件或信息写错
  
  ```bash
  git add <forgotten-file>
  git commit --amend  # 追加更改到上个提交
  ```
  
- **仅改提交信息**:  提交信息写错了怎么办？ 提交信息写成“fix bug”但想改为“fix: resolve login error”

  ```bash
  git commit --amend -m "fix: resolve login error"
  ```

  > 实践：已推送的提交用 `--amend` 后需 `git push --force`

- **临时保存更改**： 开发一半要切换分支

  ```bash
  # 当前假设在分支 feature/aaa
  git stash  # 暂存更改
  git checkout feature/bbb
  ...
  git checkout feature/aaa
  git stash pop  # 恢复更改
  ```

  > **实践**：用 git stash list 查看暂存列表

  



#### 分支操作

**删除分支**

1. 删除本地分支

   ```bash
   git branch -d feature/login  # 删除已合并分支
   git branch -D feature/login  # 强制删除未合并分支
   ```

2. 删除远程分支

   ```bash
   git push origin --delete feature/login
   # 或
   git push origin :feature/login
   ```

> **实践**：确认分支无用后再删

**修改分支名称**

1. 修改本地分支

   ```bash
   git branch -m old-name new-name  # 重命名当前分支
   git branch -m feature/old feature/new  # 重命名其他分支
   ```

2. 修改远程分支

   ```bash
   git branch -m feature/old feature/new #重命名本地分支
   git push origin feature/new #推送新分支
   git push origin --delete feature/old #删除旧分支
   
   ```

**更新远程跟踪** 

```bash
git fetch origin
git branch --unset-upstream feature/new
git branch --set-upstream-to=origin/feature/new feature/new
```



### 查看 Git 提交历史

历史查看是调试和协作的关键，Git 提供了多种工具。

#### git log：基本历史
- **命令**：
  ```bash
  git log
  ```
- **作用**：显示提交历史（哈希、作者、消息）。
- **实用变体**：
  - `git log --oneline`：单行简洁输出。
  - `git log --graph --oneline`：可视化分支结构。

**示例输出**：
```
* a1b2c3d Add login page
* d4e5f6g Initial commit
```

#### git log --graph：分支可视化
- **命令**：
  ```bash
  git log --graph --all --oneline
  ```
- **作用**：展示所有分支的合并关系。
- **场景**：检查合并历史或分支状态。

#### git reflog：操作日志
- **命令**：
  ```bash
  git reflog
  ```
- **作用**：记录 HEAD 的移动历史（包括被删除的提交），默认保留 30 天。
- **场景**：误删提交后找回。
- **示例**：
  ```
  a1b2c3d HEAD@{0}: commit: Add login page
  d4e5f6g HEAD@{1}: reset: moving to d4e5f6g
  ```
  - 找回提交：
    ```bash
    git reset --hard a1b2c3d
    
