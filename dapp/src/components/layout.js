import React, { useState } from 'react'
import classnames from 'classnames'
import Head from 'next/head'
import Link from 'next/link'
import { useStoreState } from 'pullstate'
import { useEffect, useRef } from 'react'
import { useCookies } from 'react-cookie'
import { fbt } from 'fbt-runtime'
import { useWeb3React } from '@web3-react/core'
import { get } from 'lodash'

import { useEagerConnect } from 'utils/hooks'
import AccountStore from 'stores/AccountStore'
import ContractStore from 'stores/ContractStore'
import StakeStore from 'stores/StakeStore'
import withRpcProvider from 'hoc/withRpcProvider'
import AppFooter from './AppFooter'
import MarketingFooter from './MarketingFooter'
import { adjustLinkHref } from 'utils/utils'
import { assetRootPath } from 'utils/image'

const AIRDROP_URL = 'https://governance.ousd.com/claim'
const UNISWAP_URL =
  'https://app.uniswap.org/#/swap?inputCurrency=0xdac17f958d2ee523a2206206994597c13d831ec7&outputCurrency=0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86'

const Layout = ({
  locale,
  onLocale,
  children,
  dapp,
  short,
  shorter,
  medium,
  isStakePage,
  showUniswapNotice,
  storeTransaction,
  storeTransactionError,
}) => {
  const { connector, account, library } = useWeb3React()

  const ousdContract = useStoreState(ContractStore, (s) =>
    get(s, 'contracts.ousd')
  )
  const rebaseOptedOut = useStoreState(AccountStore, (s) =>
    get(s, 'rebaseOptedOut')
  )

  const stakes = useStoreState(StakeStore, (s) => s)
  const showStakingBanner = (stakes.stakes || []).length !== 0 && !isStakePage

  const optIn = async () => {
    try {
      const result = await ousdContract
        .connect(library.getSigner(account))
        .rebaseOptIn()
      storeTransaction(result, `rebaseOptIn`, 'ousd', {})
    } catch (error) {
      // 4001 code happens when a user rejects the transaction
      if (error.code !== 4001) {
        storeTransactionError(`rebaseOptIn`, 'ousd')
      }
      console.error('Error OUSD REBASE OPT IN: ', error)
    }
  }

  return (
    <>
      <Head>
        <title>OUSD</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {isStakePage && (
          <>
            <meta
              property="og:image"
              key="og:image"
              content="https://ousd.com/images/staking-facebook.png"
            />
            <meta
              name="twitter:image"
              key="twitter:image"
              content="https://ousd.com/images/staking-twitter.png"
            />
          </>
        )}
        {!isStakePage && (
          <>
            <meta
              property="og:image"
              key="og:image"
              content="https://ousd.com/images/share-facebook.png"
            />
            <meta
              name="twitter:image"
              key="twitter:image"
              content="https://ousd.com/images/share-twitter.png"
            />
          </>
        )}
      </Head>
      <div
        className={classnames(
          'notice text-white text-center p-3',
          {
            dapp,
          },
          rebaseOptedOut ? '' : 'd-none'
        )}
      >
        <div className="container d-flex flex-column flex-md-row align-items-center">
          <img
            src={assetRootPath('/images/gnosis-safe-icon.svg')}
            className="mb-2 mb-md-0 mr-md-3"
            style={{ width: '50px' }}
          />
          {fbt(
            'It looks like you are minting from a contract and have not opted into yield. You must opt in to receive yield.',
            'Rebase opt in notice'
          )}
          <button
            onClick={optIn}
            rel="noopener noreferrer"
            className="btn btn-dark mt-3 mt-md-0 ml-md-auto"
          >
            Opt in
          </button>
        </div>
      </div>
      <div
        className={classnames(
          'notice text-white text-center p-3',
          {
            dapp,
          },
          showUniswapNotice ? '' : 'd-none'
        )}
      >
        <div className="container d-flex flex-column flex-md-row align-items-center">
          <img
            src={assetRootPath('/images/horsey.svg')}
            className="mb-2 mb-md-0 mr-md-3"
          />
          {fbt(
            'Gas fees are high right now. It might be cheaper to buy OUSD on Uniswap.',
            'Uniswap notice'
          )}
          <a
            href={UNISWAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark mt-3 mt-md-0 ml-md-auto"
          >
            Try Uniswap
          </a>
        </div>
      </div>
      <div
        className={classnames(
          `notice ${
            showStakingBanner ? 'staking pt-2' : 'pt-3'
          } text-white text-center pb-3`,
          {
            dapp,
          }
        )}
      >
        <div className="container d-flex flex-column flex-md-row align-items-center">
          {showStakingBanner ? (
            <>
              <div className="d-flex flex-column mt-0 justify-content-center px-4 px-md-0 text-md-left">
                <div className="title-text">
                  {fbt(
                    'Changes are coming to OGN staking.',
                    'Changes are coming to OGN staking.'
                  )}
                </div>
                <div className="text">
                  {fbt(
                    'Your existing stakes will not be impacted. Claim your OGN at the end of your staking period.',
                    'Your existing stakes will not be impacted. Claim your OGN at the end of your staking period.'
                  )}
                </div>
              </div>
              <div className="btn btn-dark mt-2 ml-md-auto">
                <Link href={adjustLinkHref('/earn')}>Legacy staking</Link>
              </div>
            </>
          ) : (
            <>
              {fbt('OGV airdrop is live!', 'Airdrop notice')}
              <a
                href={AIRDROP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark mt-3 mt-md-0 ml-md-auto"
              >
                Check eligibility
              </a>
            </>
          )}
        </div>
      </div>
      <main className={classnames({ dapp, short, shorter, medium })}>
        {dapp && <div className="container">{children}</div>}
        {!dapp && children}
      </main>
      {!dapp && <MarketingFooter locale={locale} />}
      {dapp && <AppFooter dapp={dapp} locale={locale} onLocale={onLocale} />}
      <style jsx>{`
        .notice {
          background-color: black;
          margin-bottom: 35px;
        }

        .notice.staking {
          background-color: #1a82ff;
        }

        .notice .title-text {
          font-size: 18px;
          font-weight: bold;
          line-height: 1.75;
          color: white;
        }

        .notice .text {
          opacity: 0.8;
          color: white;
          line-height: normal;
          font-size: 14px;
          max-width: 1000px;
        }

        .notice.dapp {
          margin-bottom: 0px;
        }

        .notice .btn {
          font-size: 12px;
          height: auto;
          padding: 5px 20px;
          background-color: white;
          color: black;
        }

        .container {
          max-width: 940px !important;
          padding-left: 0px;
          padding-right: 0px;
        }
      `}</style>
    </>
  )
}

export default withRpcProvider(Layout)
