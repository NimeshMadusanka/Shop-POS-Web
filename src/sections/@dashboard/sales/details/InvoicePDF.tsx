import { Page, View, Text, Document, Image } from '@react-pdf/renderer';
import styles from './InvoiceStyle';

// ----------------------------------------------------------------------

type Product = {
  name: string;
  netWeight: string;
  stockOutWeight: string;
  stockInWeight: string;
  rate: number;
};

type Props = {
  productData: Product[];
  totalRate:Number;
};

export default function InvoicePDF({ productData, totalRate }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.gridContainer}>
          <Image
            source={require('../../../../assets/logo.svg')}
            style={{ width: 50, height: 50 }}
          />
          <View style={{ alignItems: 'flex-start', marginBottom: 40 }}>
            <Text style={styles.h3}>Joash Cold Storage Services</Text>
            <Text style={styles.body1}>BR Reg No: WCO/02152</Text>
          </View>
        </View>

        <Text style={[styles.overline, styles.mb8]}>Invoice Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell_2}>
                <Text style={styles.subtitle2}>Item</Text>
              </View>
              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>stockIn (Kg)</Text>
              </View>
              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>stockOut (Kg)</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text style={styles.subtitle2}>Sales</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableBody}>
            {productData.map((item) => (
              <View style={styles.tableRow}>
                <View style={styles.tableCell_2}>
                  <Text>{item.name}</Text>
                </View>
                <View style={styles.tableCell_3}>
                  <Text>{item.stockInWeight}</Text>
                </View>
                <View style={styles.tableCell_3}>
                  <Text>{item.stockOutWeight}</Text>
                </View>
                <View style={[styles.tableCell_3, styles.alignRight]}>
                  <Text>{item.rate}</Text>
                </View>
              </View>
            ))}
            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3}>
                <Text>Subtotal</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text>{`${Number(totalRate)}.00`}</Text>
              </View>
            </View>

            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3}>
                <Text style={styles.h5}>Grand Total (LKR)</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text>{`${Number(totalRate)}.00`}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Footer */}
        <View style={[styles.gridContainer2, styles.footerend]}>
          <Text style={styles.h4}>End of Invoice</Text>{' '}
        </View>
        <View style={[styles.gridContainer2, styles.footer]}>
          <Text>Designed and Developed by Ollcode</Text>
        </View>
      </Page>
    </Document>
  );
}
