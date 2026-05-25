import ProductionForm from "../../components/prod-form";

export default function KFSFPackingForm() {
  return (
    <ProductionForm
      title="Packing Form"
      skuTable="kf_sku"
      submitTable="kf_sf_packing"
      skuFilterValue="sf_packing"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
