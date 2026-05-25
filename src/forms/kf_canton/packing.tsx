import ProductionForm from "../../components/prod-form";

export default function KFCantonPackingForm() {
  return (
    <ProductionForm
      title="Packing Form"
      skuTable="kf_sku"
      submitTable="kf_canton_packing"
      skuFilterValue="canton_packing"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
