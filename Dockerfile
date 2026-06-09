FROM httpd:2.4

# デフォルトのApache設定を使用
# /usr/local/apache2/htdocs/ がドキュメントルート

# カスタムindex.htmlをコピー（任意）
COPY src/ /usr/local/apache2/htdocs/

EXPOSE 80
