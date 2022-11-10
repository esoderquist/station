import { FormError } from "components/form"
import { InternalButton } from "components/general"
import { Grid } from "components/layout"
import { useIsWalletEmpty } from "data/queries/bank"
import { useMemoizedPrices } from "data/queries/coingecko"
import {
  useCustomTokensCW20,
  //useCustomTokensIBC,
} from "data/settings/CustomTokens"
import { readNativeDenom } from "data/token"
import { useTranslation } from "react-i18next"
import AddTokens from "./AddTokens"
import Asset from "./Asset"
import styles from "./AssetList.module.scss"
import { useCoins } from "./Coins"
import CW20Asset from "./CW20Asset"

const AssetList = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  //const { list: ibc } = useCustomTokensIBC()
  const { list: cw20 } = useCustomTokensCW20()
  const coins = useCoins()
  const { data: prices } = useMemoizedPrices()

  const render = () => {
    if (!coins) return

    const list = [
      ...Object.values(
        coins.reduce((acc, { denom, balance }) => {
          const data = readNativeDenom(denom)
          if (acc[data.token]) {
            acc[data.token].balance = `${
              parseInt(acc[data.token].balance) + parseInt(balance)
            }`
            acc[data.token].chainNum++
            return acc
          } else {
            return {
              ...acc,
              [data.token]: {
                denom,
                balance,
                icon: data.icon,
                symbol: data.symbol,
                price: prices?.[data.token]?.price,
                change: prices?.[data.token]?.change,
                chainNum: 1,
              },
            }
          }
        }, {} as Record<string, any>)
      ),
      /*
      ...ibc.map(({ denom, base_denom, icon, symbol }) => {
        const balance = getAmount(bankBalance, denom)
        return {
          denom,
          balance,
          icon,
          symbol,
          price: prices?.[base_denom]?.price,
          change: prices?.[base_denom]?.change,
        }
      }),*/
    ]

    return (
      <div>
        {isWalletEmpty && (
          <FormError>{t("Coins required to post transactions")}</FormError>
        )}
        <section>
          {list.map(({ denom, ...item }) => (
            <Asset
              denom={denom}
              {...readNativeDenom(denom)}
              {...item}
              key={denom}
            />
          ))}
          {!cw20.length
            ? null
            : cw20.map((item) => (
                <CW20Asset {...item} key={item.token}>
                  {(item) => <Asset {...item} denom={item.token} />}
                </CW20Asset>
              ))}
        </section>
      </div>
    )
  }

  return (
    <article className={styles.assetlist}>
      <div className={styles.assetlist__title}>
        <h3>Assets</h3>
        <AddTokens>
          {(open) => (
            <InternalButton onClick={open}>{t("Add tokens")}</InternalButton>
          )}
        </AddTokens>
      </div>
      <Grid gap={32} className={styles.assetlist__list}>
        {render()}
      </Grid>
    </article>
  )
}

export default AssetList
