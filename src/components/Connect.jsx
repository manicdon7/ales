import React, { useEffect, useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";

import {
  ConnectButton,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { polygon, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "Ales",
  projectId: "252ad358c903d28a5b6610ef5c98dac9",
  chains: [polygon, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

const Connect = ({ onWalletAddressUpdate }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connected, setConnected] = useState(false);

  // Effect to handle the update when the wallet is connected
  useEffect(() => {
    if (connected && walletAddress) {
      onWalletAddressUpdate(walletAddress);
    }
  }, [connected, walletAddress, onWalletAddressUpdate]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading";
              const isConnected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === "authenticated");

              // Update states based on connection
              if (isConnected) {
                if (!connected || walletAddress !== account?.address) {
                  setWalletAddress(account?.address);
                  setConnected(true);
                }
              } else if (connected) {
                setWalletAddress(null);
                setConnected(false);
              }

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!isConnected) {
                      return (
                        <div className="flex justify-center">
                          <button
                            onClick={openConnectModal}
                            className="text-white text-xs lg:text-base bg-transparent backdrop-filter backdrop-blur-2xl hover:scale-95 transform transition-transform duration-100 hover:shadow-xl bg-gradient-to-r from-[#0C359E] via-blue-600 to-[#EE99C2] p-3 px-6 rounded-xl md:text-base border-2 brandy-font border-white custom-border-radius flex justify-center items-center"
                          >
                            Eth Wallet
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-6 pl-2"
                            >
                              <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
                            </svg>
                          </button>
                        </div>
                      );
                    }

                    if (chain?.unsupported) {
                      return (
                        <button
                          className="text-white broge-font bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hover:bg-gradient-to-l hover:shadow-xl p-3 rounded text-[8px] md:text-xs font-medium border-b-2 border-white"
                          onClick={openChainModal}
                          type="button"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          className="text-white text-xs w-full bg-transparent backdrop-blur-2xl backdrop-filter hover:scale-105 transform transition-transform duration-100 hover:shadow-xl bg-gradient-to-r from-[#0C359E] via-blue-600 to-[#EE99C2] hover:bg-gradient-to-l p-3 px-2 rounded bricolage-font border-2"
                          onClick={openChainModal}
                          type="button"
                        >
                          {chain?.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain?.name}
                        </button>

                        <button
                          className="text-white text-xs w-full bg-transparent backdrop-blur-2xl backdrop-filter hover:scale-105 transform transition-transform duration-100 hover:shadow-xl bg-gradient-to-r from-[#0C359E] via-blue-600 to-[#EE99C2] hover:bg-gradient-to-l p-3 px-2 rounded bricolage-font border-2"
                          onClick={openAccountModal}
                          type="button"
                        >
                          {account?.displayName}
                          {account?.displayBalance ? ` (${account.displayBalance})` : ""}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Connect;
