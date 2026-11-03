# 스몰데이터랩 공개 집계 데이터 — 9월 칼럼 「한정판을 사두면 정말 오를까」

출처: 김하빈, 시사저널 「김하빈의 스몰데이터」 2026-09-30 · 대시보드 https://habinew.github.io/research-portfolio/smalldata/resell.html
생성: 2026-11-03 (export_public_csv.py) · 원천 스냅샷 기준일 2026.08.24

| 파일 | 내용 | 비고 |
|---|---|---|
| resell_by_category.csv | 카테고리별 상품 수, 정가 이하 비율, 프리미엄 중앙값, +50% 이상 비율, 누적 거래량 | 핵심 12개 카테고리, n≥30 |
| resell_eventtime.csv | 상장(출시) 후 경과 월별 프리미엄 중앙값·정가 이하·+50% 비율 | panel: balanced24(24개월 균형 패널) · hot_m1_ge50(1개월차 +50% 이상 그룹) · unbalanced(전체) |
| resell_datalab_monthly.csv | 네이버 데이터랩 월별 검색 관심도 | 키워드별 자기 피크=100 상대지수. 키워드 간 절대 비교 불가 |

- premium(프리미엄) = (최근 거래가 − 정가) / 정가. 0.1 = +10%.
- share_* 는 상품 수 기준 비율(거래량 가중 아님).
- 개별 매물·거래 원본은 플랫폼 약관상 공개하지 않는다. 집계표만 제공.
- 라이선스: CC BY 4.0 (인용: 김하빈 (2026). 스몰데이터랩 공개 집계 데이터 — 리셀. https://habinew.github.io/research-portfolio/smalldata/)
