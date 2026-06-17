CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO users (name) VALUES
('田中'),
('佐藤'),
('鈴木');


CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO places (name) VALUES
('301教室'),
('302教室'),
('303教室'),
('304教室'),
('401教室'),
('402教室'),
('403教室'),
('404教室'),
('CG実習室'),
('CAD実習室'),
('プログラミング実習室'),
('ネットワーク実習室'),
('AI実習室'),
('ゲーム制作実習室'),
('レコーディングスタジオ'),
('ダンススタジオ'),
('デザイン実習室'),
('自動車整備実習室'),
('視聴覚ホール'),
('図書室');