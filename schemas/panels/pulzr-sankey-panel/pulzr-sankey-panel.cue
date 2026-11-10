package model

import (
	"github.com/perses/shared/cue/common"
)

kind: "PulzrSankeyPanel"
spec: close({
	// At least one: from a node to another, valued by the last value of the series named.
	links: [#link, ...#link]
	format?: common.#format
	// A color per node name, any CSS color.
	colors?: [string]: string & !=""
})

#link: close({
	from:   string & !=""
	to:     string & !=""
	series: string & !=""
})
