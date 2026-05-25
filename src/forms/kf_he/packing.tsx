import ProductionForm from "../../components/prod-form";

export default function KFHEPackingForm() {
  return (
    <ProductionForm
      title="Packing Form"
      skuTable="kf_sku"
      submitTable="kf_he_packing"
      skuFilterValue="he_packing"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
