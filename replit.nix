{ pkgs }: {
	deps = [];
  	env = { LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid]; };
}
