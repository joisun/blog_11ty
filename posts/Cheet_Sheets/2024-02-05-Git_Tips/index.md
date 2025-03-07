---
title: Git Tips
date: 2024-02-05
tags:
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



## 远程仓库管理

| 说明                   | 命令                                                      | 示例                                                         |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 添加新的远程仓库       | `git remote add <Remote_Repo> <Git_Url>`                  | `git remote add gitee git@gitee.com:jaycesun/example.git`    |
| 推送本地到某个远程仓库 | `git push <Remote_Repo> <Local_BranchX>:<Remove_BranchX>` | `git push gitee main:main`                                   |
| 查看远程仓库           | `git remote -v`                                           |                                                              |
| 修改远程仓库地址       | `git remote set-url <Remote_Repo> <Git_Url>`              | `git remote set-url origin https://github.com/OWNER/REPOSITORY.git` |
| 修改远程仓库名称       | `git remote rename  <Remote_Repo> <New_Remote_Repo>`      | `git remote rename origin destination`                       |
| 删除远程仓库配置·      | `git remote rm <Remote_Repo>`                             | `git remote rm gitee`                                        |
|                        |                                                           |                                                              |
