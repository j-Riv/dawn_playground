if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined;
      quantityForm = undefined;
      onVariantChangeUnsubscriber = undefined;
      cartUpdateUnsubscriber = undefined;
      abortController = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];

      constructor() {
        super();

        this.quantityInput = this.querySelector('.quantity__input');
        // delete
        // const va = document.querySelector(
        //   `[data-variant-availability]`
        // );
           
        // parse this as json
        // this needs to be updated to be dynamic
        // const vaHTML = va.innerHTML;
        // const vaJSON = JSON.parse(vaHTML);
        // this.idToName = vaJSON.id_to_name;
        // this.nameToId = vaJSON.name_to_id;
        // this.variantOptions = vaJSON.variant_options;
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );

        this.initQuantityHandlers();
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }));
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback);
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.quantityForm = this.querySelector('.product-form__quantity');
        if (!this.quantityForm) return;

        this.setQuantityBoundries();
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.fetchQuantityRules.bind(this));
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.cartUpdateUnsubscriber?.();
      }

      initializeProductSwapUtility() {
        this.preProcessHtmlCallbacks.push((html) =>
          html.querySelectorAll('.scroll-trigger').forEach((element) => element.classList.add('scroll-trigger--cancel'))
        );
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues, optionsLength, position } }) {
        if (!this.contains(event.target)) return;
        
        // start new feature
        console.log('who is this???', this);
        // maybe overwrite selectedOptions here with valid ones based on first and second
        // maybe loop through variants create array of arrays [[1111,22222,3333], [1111, 2222, 4444]]
        // or object with option1 as key
        // on click parse __main-1 through 3 to know what option they selected
        // search PUB_SUB_EVENTS.optionValueSelectionChange and overwrite that to send the option number
        console.log('this.handleOptionValueChange', { event, target, selectedOptionValues, optionsLength, position });
      
        const va = document.querySelector(
          `[data-variant-availability]`
        );
           
        const vaHTML = va.innerHTML;
        const vaJSON = JSON.parse(vaHTML);
        // console.log('vaJSON', vaJSON);
        
        this.idToName = vaJSON.id_to_name;
        this.nameToId = vaJSON.name_to_id;
        this.variantOptions = vaJSON.variant_options;
        console.log('variantOptions', this.variantOptions);
        
        const selectedOption1 = parseInt(selectedOptionValues[0]);
        const opt1 = this.idToName.option1[selectedOption1];
        const selectedOption2 = parseInt(selectedOptionValues[1]);
        const opt2 = this.idToName.option2[selectedOption2];
        const selectedOption3 = parseInt(selectedOptionValues[2]);
        const opt3 = this.idToName.option3[selectedOption3];

        
        if (position === '1') {
          console.log('change in option 1');
          // find first available variant with option 1
          const optionsWith1 = this.variantOptions.filter(v => v.option1 === opt1);
          console.log('optionsWith1', optionsWith1);
          if (optionsWith1.length === 0) {
            console.log('no variants with option 1');
            return;
          }
          // check selecetd option 2
          const optionsWith2 = optionsWith1.filter(v => v.option2 === opt2);
          console.log('optionsWith2', optionsWith2);
          let match = false;
          if (optionsWith2.length > 0) {
            match = true;
          }
          console.log('match', match);
          if (!match) {
            // find first match using option 1
            const firstMatch = optionsWith1[0];
            // update selectedOptionValues
            selectedOptionValues[1] = this.nameToId.option2[firstMatch.option2];
            selectedOptionValues[2] = this.nameToId.option3[firstMatch.option3];
            // if combined listing
            if (optionsLength === 4) {
              selectedOptionValues[3] = this.nameToId.option4[firstMatch.option4];
            }
          } else { 
            const firstMatch = optionsWith2[0];
            selectedOptionValues[1] = this.nameToId.option2[firstMatch.option2];
            selectedOptionValues[2] = this.nameToId.option3[firstMatch.option3];
            // if combined listing
            if (optionsLength === 4) {
              selectedOptionValues[3] = this.nameToId.option4[firstMatch.option4];
            }
          }
        } else if (position === '2') {
          console.log('change in option 2');
          // find first available variant with option 2
          const optionsWith2 = this.variantOptions.filter(v => v.option2 === opt2);
          console.log('optionsWith2', optionsWith2);
          if (optionsWith2.length === 0) {
            console.log('no variants with option 2');
            return;
          }
          // check selecetd option 1
          const optionsWith1 = optionsWith2.filter(v => v.option1 === opt1);
          console.log('optionsWith1', optionsWith1);
          let match = false;
          if (optionsWith1.length > 0) {
            match = true;
          }
          if (!match) {
            // find first match using option 2
            const firstMatch = optionsWith2[0];
            // update selectedOptionValues
            selectedOptionValues[0] = this.nameToId.option1[firstMatch.option1];
            selectedOptionValues[2] = this.nameToId.option3[firstMatch.option3];
            // if combined listing
            if (optionsLength === 4) {
              selectedOptionValues[3] = this.nameToId.option4[firstMatch.option4];
            }
          } else {
            const firstMatch = optionsWith1[0];
            selectedOptionValues[0] = this.nameToId.option1[firstMatch.option1];
            selectedOptionValues[2] = this.nameToId.option3[firstMatch.option3];
            // if combined listing
            if (optionsLength === 4) {
              selectedOptionValues[3] = this.nameToId.option4[firstMatch.option4];
            }
          }
        } else if (position === '3') {
          // find first available variant with option 3
          console.log('change in option 3');
          const optionsWith3 = this.variantOptions.filter(v => v.option3 === opt3);
          console.log('optionsWith3', optionsWith3);
          if (optionsWith3.length === 0) {
            console.log('no variants with option 3');
            return;
          }
          // check selecetd option 1
          const optionsWith1 = optionsWith3.filter(v => v.option1 === opt1);
          console.log('optionsWith1', optionsWith1);
          let match = false;
          if (optionsWith1.length > 0) {
            match = true;
          }
          console.log('match', match);
          if (!match) {
            // find first match using option 3
            const firstMatch = optionsWith3[0];
            // update selectedOptionValues
            selectedOptionValues[0] = this.nameToId.option1[firstMatch.option1];
            selectedOptionValues[1] = this.nameToId.option2[firstMatch.option2];
            // if combined listing
            if (optionsLength === 4) {
              selectedOptionValues[3] = this.nameToId.option4[firstMatch.option4];
            }
          } else {
            const firstMatch = optionsWith1[0];
            selectedOptionValues[0] = this.nameToId.option1[firstMatch.option1];
            selectedOptionValues[1] = this.nameToId.option2[firstMatch.option2];
            // if combined listing
            if (optionsLength === 4) {
              selectedOptionValues[3] = this.nameToId.option4[firstMatch.option4];
            }
          }
        } else if (position === '4') { 
          // find first availalbe with option 4
          console.log('change in option 4');
          const selectedOption4 = parseInt(selectedOptionValues[3]);
          console.log('selectedOption4', selectedOption4);
          const opt4 = this.idToName.option4[selectedOption4];
          const optionsWith4 = this.variantOptions.filter(v => v.option4 === opt4);
          console.log('optionsWith4', optionsWith4);
          if (optionsWith4.length === 0) {
            console.log('no variants with option 4');
            return;
          }
          // check selected option 1
          const optionsWith1 = optionsWith4.filter(v => v.option1 === opt1);
          console.log('optionsWith1', optionsWith1);
          let match = false;
          if (optionsWith1.length > 0) {
            match = true;
          }
          console.log('match', match);
          if (!match) {
            // find first match using option 4
            const firstMatch = optionsWith4[0];
            // update selectedOptionValues
            selectedOptionValues[0] = this.nameToId.option1[firstMatch.option1];
            selectedOptionValues[1] = this.nameToId.option2[firstMatch.option2];
            selectedOptionValues[2] = this.nameToId.option3[firstMatch.option3];
          } else { 
            const firstMatch = optionsWith1[0];
            selectedOptionValues[0] = this.nameToId.option1[firstMatch.option1];
            selectedOptionValues[1] = this.nameToId.option2[firstMatch.option2];
            selectedOptionValues[2] = this.nameToId.option3[firstMatch.option3];
          }
        } else { 
          console.log('position', position);
          console.log('something went wrong');
        }
        
        console.log('updated selectedOptionValues', selectedOptionValues);
        
        // end new feature

        this.resetProductFormState();
        
        // overwriite the product url based on first option
        // const firstOption = document.querySelector('input[data-option-position="1"][data-option-value-id]="' + selectedOptionValues[0] + '"]');
        const firstOption = document.querySelector('[data-option-value-id="' + selectedOptionValues[0] + '"]');
        console.log('firstOption', firstOption);
        let productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url
        if (firstOption) { 
          console.log('firstOption.dataset.productUrl', firstOption.dataset.productUrl);
          productUrl = firstOption.dataset.productUrl;
        }

        // const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        this.pendingRequestUrl = productUrl;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;
        console.log('shouldSwapProduct', shouldSwapProduct);
        console.log('shouldFetchFullPage', shouldFetchFullPage);

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
            : this.handleUpdateProductInfo(productUrl),
        });
    
        
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
        productForm?.handleErrorMessage();
      }

      handleSwapProduct(productUrl, updateFullPage) {

        return (html) => {
          this.productModal?.remove();

          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;

            HTMLUpdateUtility.viewTransition(
              document.querySelector('main'),
              html.querySelector('main'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          } else {
            HTMLUpdateUtility.viewTransition(
              this,
              html.querySelector('product-info'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          }
        };
      }

      renderProductInfo({ requestUrl, targetId, callback }) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            callback(html);
          })
          .then(() => {
            // set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}?${params.join('&')}`;
      }

      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        if (variantSelects) {
          HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
        }
      }

      handleUpdateProductInfo(productUrl) {
        // delete
        console.log('this.handleUpdateProductInfo', { productUrl });
        return (html) => {
          const variant = this.getSelectedVariant(html);

          this.pickupAvailability?.update(variant);
          this.updateOptionValues(html);
          this.updateURL(productUrl, variant?.id);
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }

          this.updateMedia(html, variant?.featured_media?.id);

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);
            const destination = this.querySelector(`#${id}-${this.dataset.section}`);
            if (source && destination) {
              destination.innerHTML = source.innerHTML;
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('price');
          updateSourceFromDestination('Sku', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Inventory', ({ innerText }) => innerText === '');
          updateSourceFromDestination('Volume');
          updateSourceFromDestination('Price-Per-Item', ({ classList }) => classList.contains('hidden'));

          this.updateQuantityRules(this.sectionId, html);
          this.querySelector(`#Quantity-Rules-${this.dataset.section}`)?.classList.remove('hidden');
          this.querySelector(`#Volume-Note-${this.dataset.section}`)?.classList.remove('hidden');

          this.productForm?.toggleSubmitButton(
            html.getElementById(`ProductSubmitButton-${this.sectionId}`)?.hasAttribute('disabled') ?? true,
            window.variantStrings.soldOut
          );

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          });
        };
      }

      updateVariantInputs(variantId) {
        this.querySelectorAll(
          `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
        ).forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          input.value = variantId ?? '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      updateURL(url, variantId) {
        this.querySelector('share-button')?.updateUrl(
          `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
        );

        if (this.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable);

        const selectors = ['price', 'Inventory', 'Sku', 'Price-Per-Item', 'Volume-Note', 'Volume', 'Quantity-Rules']
          .map((id) => `#${id}-${this.dataset.section}`)
          .join(', ');
        document.querySelectorAll(selectors).forEach(({ classList }) => classList.add('hidden'));
      }

      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return;

        const mediaGallerySource = this.querySelector('media-gallery ul');
        const mediaGalleryDestination = html.querySelector(`media-gallery ul`);

        const refreshSourceData = () => {
          if (this.hasAttribute('data-zoom-on-hover')) enableZoomOnHover(2);
          const mediaGallerySourceItems = Array.from(mediaGallerySource.querySelectorAll('li[data-media-id]'));
          const sourceSet = new Set(mediaGallerySourceItems.map((item) => item.dataset.mediaId));
          const sourceMap = new Map(
            mediaGallerySourceItems.map((item, index) => [item.dataset.mediaId, { item, index }])
          );
          return [mediaGallerySourceItems, sourceSet, sourceMap];
        };

        if (mediaGallerySource && mediaGalleryDestination) {
          let [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
          const mediaGalleryDestinationItems = Array.from(
            mediaGalleryDestination.querySelectorAll('li[data-media-id]')
          );
          const destinationSet = new Set(mediaGalleryDestinationItems.map(({ dataset }) => dataset.mediaId));
          let shouldRefresh = false;

          // add items from new data not present in DOM
          for (let i = mediaGalleryDestinationItems.length - 1; i >= 0; i--) {
            if (!sourceSet.has(mediaGalleryDestinationItems[i].dataset.mediaId)) {
              mediaGallerySource.prepend(mediaGalleryDestinationItems[i]);
              shouldRefresh = true;
            }
          }

          // remove items from DOM not present in new data
          for (let i = 0; i < mediaGallerySourceItems.length; i++) {
            if (!destinationSet.has(mediaGallerySourceItems[i].dataset.mediaId)) {
              mediaGallerySourceItems[i].remove();
              shouldRefresh = true;
            }
          }

          // refresh
          if (shouldRefresh) [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();

          // if media galleries don't match, sort to match new data order
          mediaGalleryDestinationItems.forEach((destinationItem, destinationIndex) => {
            const sourceData = sourceMap.get(destinationItem.dataset.mediaId);

            if (sourceData && sourceData.index !== destinationIndex) {
              mediaGallerySource.insertBefore(
                sourceData.item,
                mediaGallerySource.querySelector(`li:nth-of-type(${destinationIndex + 1})`)
              );

              // refresh source now that it has been modified
              [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData();
            }
          });
        }

        // set featured media as active in the media gallery
        this.querySelector(`media-gallery`)?.setActiveMedia?.(
          `${this.dataset.section}-${variantFeaturedMediaId}`,
          true
        );

        // update media modal
        const modalContent = this.productModal?.querySelector(`.product-media-modal__content`);
        const newModalContent = html.querySelector(`product-modal .product-media-modal__content`);
        if (modalContent && newModalContent) modalContent.innerHTML = newModalContent.innerHTML;
      }

      setQuantityBoundries() {
        const data = {
          cartQuantity: this.quantityInput.dataset.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0,
          min: this.quantityInput.dataset.min ? parseInt(this.quantityInput.dataset.min) : 1,
          max: this.quantityInput.dataset.max ? parseInt(this.quantityInput.dataset.max) : null,
          step: this.quantityInput.step ? parseInt(this.quantityInput.step) : 1,
        };

        let min = data.min;
        const max = data.max === null ? data.max : data.max - data.cartQuantity;
        if (max !== null) min = Math.min(min, max);
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step);

        this.quantityInput.min = min;

        if (max) {
          this.quantityInput.max = max;
        } else {
          this.quantityInput.removeAttribute('max');
        }
        this.quantityInput.value = min;

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined);
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        this.querySelector('.quantity__rules-cart .loading__spinner').classList.remove('hidden');
        fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateQuantityRules(this.dataset.section, html);
          })
          .catch((e) => console.error(e))
          .finally(() => this.querySelector('.quantity__rules-cart .loading__spinner').classList.add('hidden'));
      }

      updateQuantityRules(sectionId, html) {
        if (!this.quantityInput) return;
        this.setQuantityBoundries();

        const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`);
        const selectors = ['.quantity__input', '.quantity__rules', '.quantity__label'];
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector);
          const updated = quantityFormUpdated.querySelector(selector);
          if (!current || !updated) continue;
          if (selector === '.quantity__input') {
            const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step'];
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute);
              if (valueUpdated !== null) {
                current.setAttribute(attribute, valueUpdated);
              } else {
                current.removeAttribute(attribute);
              }
            }
          } else {
            current.innerHTML = updated.innerHTML;
          }
        }
      }

      get productForm() {
        return this.querySelector(`product-form`);
      }

      get productModal() {
        return document.querySelector(`#ProductModal-${this.dataset.section}`);
      }

      get pickupAvailability() {
        return this.querySelector(`pickup-availability`);
      }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get relatedProducts() {
        const relatedProductsSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'related-products'
        );
        return document.querySelector(`product-recommendations[data-section-id^="${relatedProductsSectionId}"]`);
      }

      get quickOrderList() {
        const quickOrderListSectionId = SectionId.getIdForSection(
          SectionId.parseId(this.sectionId),
          'quick_order_list'
        );
        return document.querySelector(`quick-order-list[data-id^="${quickOrderListSectionId}"]`);
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }
    }
  );
}
