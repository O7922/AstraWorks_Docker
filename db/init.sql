CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO places (name) VALUES
('301教室'),
('302教室'),
('303教室'),
('迫真空手部');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO users (name) VALUES
('イキスギ'),
('田中'),
('佐藤'),
('鈴木');

-- ノード(球体)
-- リンクという概念は独立テーブルを持たず、
-- 「どのノードとpeer(隣接)関係にあるか」を各ノードのpeersカラムに保存する
-- この方がルーティング計算をしやすいはず。
--
-- 【peersの形式】各要素は { id, dist } 形式のオブジェクト。
--   id   : 隣接ノードのID
--   dist : ルートエディタでの編集(ノード設置・リンク作成・ドラッグ移動)時に
--          あらかじめ計算しておいたユークリッド距離。
--   例: [{"id":"n2","dist":5}, {"id":"n4","dist":5}]
CREATE TABLE route_nodes (
    id VARCHAR(20) PRIMARY KEY,          -- フロント側で発行するID (例: n1, n2 ...)
    x DOUBLE NOT NULL,
    y DOUBLE NOT NULL,
    z DOUBLE NOT NULL,
    peers JSON NOT NULL DEFAULT (JSON_ARRAY())  -- 隣接ノード情報の配列 (例: [{"id":"n2","dist":5}])
);

-- ============================================================
-- サンプルデータ(動作確認用)
-- ============================================================
-- 以下のような単純な経路網を想定:
--
--   n1 --5-- n2 --5-- n3(301教室)
--             |
--             5
--             |
--            n4(302教室) --5-- n5(303教室)
--             |
--             5
--             |
--            n6(迫真空手部・入口A) --3-- n7(迫真空手部・入口B)
--
-- 「迫真空手部」は n6, n7 の2つのノード(入り口)に紐づけてあり、
-- 3Dmap_alpha03.html の道案内機能で「施設が複数ノードに存在する場合、
-- 最短距離でたどり着ける方を終点に選ぶ」動作を確認できるようにしてある。
--
-- ★注意: これはあくまで動作確認用のダミー座標(GLBの実座標とは無関係)。
--   実際の校舎GLBを使う際は、3Droute_editor04.html 上でノードを配置し直し、
--   「保存」ボタンで route_nodes を洗い替え保存すること。
--   (保存すると route_nodes は全削除→再INSERTされるため、このサンプル行は
--    エディタで一度保存した時点で実データに置き換わります)
-- ============================================================
INSERT INTO route_nodes (id, x, y, z, peers) VALUES
('n1', 0,  0, 0,  JSON_ARRAY(JSON_OBJECT('id','n2','dist',5))),
('n2', 5,  0, 0,  JSON_ARRAY(
                       JSON_OBJECT('id','n1','dist',5),
                       JSON_OBJECT('id','n3','dist',5),
                       JSON_OBJECT('id','n4','dist',5)
                   )),
('n3', 10, 0, 0,  JSON_ARRAY(JSON_OBJECT('id','n2','dist',5))),
('n4', 5,  0, 5,  JSON_ARRAY(
                       JSON_OBJECT('id','n2','dist',5),
                       JSON_OBJECT('id','n5','dist',5),
                       JSON_OBJECT('id','n6','dist',5)
                   )),
('n5', 10, 0, 5,  JSON_ARRAY(JSON_OBJECT('id','n4','dist',5))),
('n6', 5,  0, 10, JSON_ARRAY(
                       JSON_OBJECT('id','n4','dist',5),
                       JSON_OBJECT('id','n7','dist',3)
                   )),
('n7', 8,  0, 10, JSON_ARRAY(JSON_OBJECT('id','n6','dist',3)));

-- ============================================================
-- 施設ノード関連付けテーブル
-- 「施設名ID, ノードID」の組だけを持つ、純粋な紐づけ専用テーブル。
-- 1つの施設(place)は複数ノードに、1つのノードは複数施設に紐づけられる(多対多)。
--
-- 例: 施設A(id=01)がノードB(id=n01)、ノードC(id=n02)に紐づく場合
--   place_id | node_id
--   01       | n01
--   01       | n02
-- という2レコードになる。
--
-- 施設名そのものは places テーブルにのみ存在する(正規化)。
-- そのため施設名を変更する操作は「places.name を UPDATE する」だけでよく、
-- このテーブル(place_node_link)側にレコードの変更は発生しない。
-- （place_node.js の PUT /:place_id はこの理由で places のみ更新する）
--
-- node_id はフロント側(3Dエディタ)で発行される route_nodes.id (例: "n3") を指す。
-- ただし route_nodes 側はエディタ上で保存前のノードにも施設を紐づけたいという
-- 運用上の理由から、あえて FOREIGN KEY 制約を付けていない(INDEXのみ)。
-- 厳密な整合性が必要な場合は route_nodes 保存後にのみ施設登録を許可する運用、
-- または外部キー制約を追加すること。
-- ============================================================
CREATE TABLE place_node_link (
    place_id INT NOT NULL,
    node_id  VARCHAR(20) NOT NULL,
    PRIMARY KEY (place_id, node_id),
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    INDEX idx_place_node_link_node_id (node_id)
);

-- サンプルデータ: 301/302/303教室は1ノードずつ、
-- 「迫真空手部」だけ2ノード(入口A/入口B)に紐づけて多対多の例を作る。
INSERT INTO place_node_link (place_id, node_id) VALUES
(1, 'n3'),  -- 301教室
(2, 'n4'),  -- 302教室
(3, 'n5'),  -- 303教室
(4, 'n6'),  -- 迫真空手部(入口A)
(4, 'n7');  -- 迫真空手部(入口B)