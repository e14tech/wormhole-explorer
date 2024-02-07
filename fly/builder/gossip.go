package builder

import (
	"github.com/certusone/wormhole/node/pkg/common"
	gossipv1 "github.com/certusone/wormhole/node/pkg/proto/gossip/v1"
	"github.com/wormhole-foundation/wormhole-explorer/fly/config"
	"github.com/wormhole-foundation/wormhole-explorer/fly/gossip"
)

func NewGossipChannels(cfg *config.Configuration) *gossip.GossipChannels {

	return &gossip.GossipChannels{

		SendChannel: make(chan []byte),

		ObsvChannel: make(chan *common.MsgWithTimeStamp[gossipv1.SignedObservation], cfg.ObservationsChannelSize),

		ObsvReqChannel: make(chan *gossipv1.ObservationRequest, 50),

		SignedInChannel: make(chan *gossipv1.SignedVAAWithQuorum, cfg.VaasChannelSize),

		HeartbeatChannel: make(chan *gossipv1.Heartbeat, cfg.HeartbeatsChannelSize),

		GovConfigChannel: make(chan *gossipv1.SignedChainGovernorConfig, cfg.GovernorConfigChannelSize),

		GovStatusChannel: make(chan *gossipv1.SignedChainGovernorStatus, cfg.GovernorStatusChannelSize),
	}
}
