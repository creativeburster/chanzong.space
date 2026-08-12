<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap | 禅宗知识库</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif; color: #334155; background-color: #f8fafc; margin: 0; padding: 40px 20px; }
          .container { max-width: 1000px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 10px; letter-spacing: -0.02em; }
          .subtitle { font-size: 14px; color: #64748b; margin-bottom: 30px; line-height: 1.5; }
          .subtitle a { color: #b45309; text-decoration: none; font-weight: 600; }
          .subtitle a:hover { text-decoration: underline; }
          .stats { font-weight: 700; color: #0f172a; margin-bottom: 20px; font-size: 14px; }
          details { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          details[open] { border-color: #cbd5e1; }
          summary { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; cursor: pointer; font-size: 16px; font-weight: 700; color: #0f172a; user-select: none; list-style: none; }
          summary::-webkit-details-marker { display: none; }
          summary:hover { filter: brightness(0.97); }
          summary .left { display: flex; align-items: center; gap: 10px; }
          .group-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
          .arrow { color: #94a3b8; font-size: 14px; transition: transform 0.2s; }
          details[open] .arrow { transform: rotate(90deg); }
          .g-static summary { background: #f8fafc; } .g-static .group-badge { background: #f1f5f9; color: #334155; }
          .g-classics summary { background: #fffbeb; } .g-classics .group-badge { background: #fef3c7; color: #92400e; }
          .g-concepts summary { background: #ecfdf5; } .g-concepts .group-badge { background: #d1fae5; color: #065f46; }
          .g-methods summary { background: #f0f9ff; } .g-methods .group-badge { background: #e0f2fe; color: #075985; }
          .g-koans summary { background: #fff1f2; } .g-koans .group-badge { background: #ffe4e6; color: #9f1239; }
          .g-persons summary { background: #faf5ff; } .g-persons .group-badge { background: #f3e8ff; color: #6b21a8; }
          .g-faqs summary { background: #fffbeb; } .g-faqs .group-badge { background: #fef3c7; color: #b45309; }
          .table-wrap { max-height: 480px; overflow-y: auto; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { background-color: #f1f5f9; color: #475569; padding: 10px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; position: sticky; top: 0; }
          tr:hover td { background-color: #f8fafc; }
          td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; line-height: 1.5; word-break: break-all; }
          td a { color: #b45309; text-decoration: none; font-weight: 600; }
          td a:hover { text-decoration: underline; }
          .priority-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
          .priority-high { background: #fef3c7; color: #92400e; }
          .priority-mid { background: #eff6ff; color: #1d4ed8; }
          .priority-low { background: #f1f5f9; color: #64748b; }
          .footer { max-width: 1000px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #94a3b8; }
          .footer a { color: #b45309; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>XML Sitemap · 禅宗知识库</h1>
          <p class="subtitle">本文件为面向搜索引擎的 XML 站点地图。更多信息请访问 <a href="https://sitemaps.org">sitemaps.org</a>。</p>
          <p class="stats">共 <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> 个页面</p>

          <details class="g-static" open="open">
            <summary><div class="left"><span>主要页面</span><span class="group-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url[not(contains(sitemap:loc,'/classics/')) and not(contains(sitemap:loc,'/concepts/')) and not(contains(sitemap:loc,'/methods/')) and not(contains(sitemap:loc,'/koan/')) and not(contains(sitemap:loc,'/persons/')) and not(contains(sitemap:loc,'/faq'))])"/></span></div><span class="arrow">▶</span></summary>
            <div class="table-wrap"><table><thead><tr><th>URL</th><th style="width:130px;">更新频率</th><th style="width:90px;text-align:center;">优先级</th></tr></thead><tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url[not(contains(sitemap:loc,'/classics/')) and not(contains(sitemap:loc,'/concepts/')) and not(contains(sitemap:loc,'/methods/')) and not(contains(sitemap:loc,'/koan/')) and not(contains(sitemap:loc,'/persons/')) and not(contains(sitemap:loc,'/faq'))]"><xsl:call-template name="row"/></xsl:for-each>
            </tbody></table></div>
          </details>

          <details class="g-classics">
            <summary><div class="left"><span>经典著作</span><span class="group-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/classics/')])"/></span></div><span class="arrow">▶</span></summary>
            <div class="table-wrap"><table><thead><tr><th>URL</th><th style="width:130px;">更新频率</th><th style="width:90px;text-align:center;">优先级</th></tr></thead><tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/classics/')]"><xsl:call-template name="row"/></xsl:for-each>
            </tbody></table></div>
          </details>

          <details class="g-concepts">
            <summary><div class="left"><span>核心概念</span><span class="group-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/concepts/')])"/></span></div><span class="arrow">▶</span></summary>
            <div class="table-wrap"><table><thead><tr><th>URL</th><th style="width:130px;">更新频率</th><th style="width:90px;text-align:center;">优先级</th></tr></thead><tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/concepts/')]"><xsl:call-template name="row"/></xsl:for-each>
            </tbody></table></div>
          </details>

          <details class="g-methods">
            <summary><div class="left"><span>修持法门</span><span class="group-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/methods/')])"/></span></div><span class="arrow">▶</span></summary>
            <div class="table-wrap"><table><thead><tr><th>URL</th><th style="width:130px;">更新频率</th><th style="width:90px;text-align:center;">优先级</th></tr></thead><tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/methods/')]"><xsl:call-template name="row"/></xsl:for-each>
            </tbody></table></div>
          </details>

          <details class="g-koans">
            <summary><div class="left"><span>禅宗公案</span><span class="group-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/koan/')])"/></span></div><span class="arrow">▶</span></summary>
            <div class="table-wrap"><table><thead><tr><th>URL</th><th style="width:130px;">更新频率</th><th style="width:90px;text-align:center;">优先级</th></tr></thead><tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/koan/')]"><xsl:call-template name="row"/></xsl:for-each>
            </tbody></table></div>
          </details>

          <details class="g-persons">
            <summary><div class="left"><span>祖师人物</span><span class="group-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/persons/')])"/></span></div><span class="arrow">▶</span></summary>
            <div class="table-wrap"><table><thead><tr><th>URL</th><th style="width:130px;">更新频率</th><th style="width:90px;text-align:center;">优先级</th></tr></thead><tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/persons/')]"><xsl:call-template name="row"/></xsl:for-each>
            </tbody></table></div>
          </details>

          <details class="g-faqs">
            <summary><div class="left"><span>经典问答</span><span class="group-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/faq')])"/></span></div><span class="arrow">▶</span></summary>
            <div class="table-wrap"><table><thead><tr><th>URL</th><th style="width:130px;">更新频率</th><th style="width:90px;text-align:center;">优先级</th></tr></thead><tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc,'/faq')]"><xsl:call-template name="row"/></xsl:for-each>
            </tbody></table></div>
          </details>

        </div>
        <div class="footer">© 禅宗知识库 (chanzong.space) · 传承顿悟见性之道</div>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="row">
    <tr>
      <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
      <td><xsl:value-of select="sitemap:changefreq"/></td>
      <td style="text-align:center;">
        <xsl:choose>
          <xsl:when test="sitemap:priority &gt;= 0.9"><span class="priority-badge priority-high"><xsl:value-of select="sitemap:priority"/></span></xsl:when>
          <xsl:when test="sitemap:priority &gt;= 0.7"><span class="priority-badge priority-mid"><xsl:value-of select="sitemap:priority"/></span></xsl:when>
          <xsl:otherwise><span class="priority-badge priority-low"><xsl:value-of select="sitemap:priority"/></span></xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
