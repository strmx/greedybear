function d2r(d) {
  let n = d * (Math.PI / 180);
  return Math.round(n * 1000) / 1000;
}

export = d2r;
