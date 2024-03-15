export const EventCodes = [
  /* We only support a subset of the event codes here.
   * Reference: https://github.com/esc-group/tb-gateways/blob/main/ats/lib/jnl/codes.py
   */
  { name: 'Call Button Alarm', onCode: 'PAL', offCode: 'PAR' },
  { name: 'Call Button Battery', onCode: 'PLB', offCode: 'PBO' },
  { name: 'Quantum Transmitter Battery', onCode: 'TBL', offCode: 'TBO' },
  { name: 'Universal Transmitter Battery', onCode: 'UTL', offCode: 'UTO' },
  { name: 'Universal Transmitter Tamper', onCode: 'UTT', offCode: 'UTC' },
  { name: 'Transmitter Detection', onCode: 'WTM', offCode: 'WTD' },
];
